import { PageReplacementAlgorithm } from "../src/abstract/PageReplacementAlgorithm";
import {Memory} from "../src/models/Memory";
import {MemoryManagementUnit} from "../src/models/MemoryManagementUnit";
import {PageTable} from "../src/models/PageTable";
import {ProcessingUnit} from "../src/models/ProcessingUnit";
import {Simulation} from "../src/models/Simulation";
import {SimulationProcess} from "../src/models/SimulationProcess";
import {Storage} from "../src/models/Storage";
import {Logger} from "../src/utils/Logger";
import {ProcessGenerator} from "../src/utils/ProcessGenerator";
import {
  updateMiddleRightBoxContent,
  updateMiddleLeftTableContent,
  updateRightBoxContent,
} from "./ui";

/**
 * Generates memory data for the right box
 * @param pu Processing unit to prepare memory data for
 * @returns Box contents string
 */
export const prepareMemoryData = (pu: ProcessingUnit, pra: PageReplacementAlgorithm) => {
  let data = "";
  const loadedPage = "{blue-bg} {/blue-bg}";
  const freePage = "{white-bg} {/white-bg}";
  const hitPage = "{yellow-bg} {/yellow-bg}";
  const missPage = "{red-bg} {/red-bg}";
  const table = pu.mmu.pageTable;
  const lastOne = pu.lastRead;

  for (let i = 0; i < table.pageCount; i++) {
    if (lastOne) {
      const {page, offset} = table.getPageAddress(lastOne);
      if (page === i) {
        if (pu.hits[pu.hits.length - 1] === lastOne) data += hitPage;
        else data += missPage;
        continue;
      }
    }
    const pageObject = table.pageTable[i];
    if (pageObject.valid) data += loadedPage;
    else data += freePage;
  }
  data += "\n Last read: " + (lastOne ?? 'none');
  data += "\n Hits: " + pu.hits.length;
  data += "\n Misses: " + pu.misses.length;

  data+= `\n\n${pra.logState()}`;

  data += `\n
  {white-bg} {/white-bg} Unallocated page
  {blue-bg} {/blue-bg} Allocated page
  {yellow-bg} {/yellow-bg} Hit
  {red-bg} {/red-bg} Miss
  `
  return data;
};

/**
 * This script is an abstraction layer needed to control the simulation and
 * display its data on the CLI UI. It is not the actual part of simulation code.
 */

/**
 * Runs the simulation
 * @param simulationSettings Simulation settings
 */
export const runSimulation = (simulationSettings: any) => {
  /**
   * Process count
   */
  let processCount = 0;

  /**
   * Planned process list
   */
  let processList: Array<{process: SimulationProcess; arrivalTime: number}> =
    [];

  const mmu = new MemoryManagementUnit(
    new PageTable(
      simulationSettings.pageCount,
      simulationSettings.frameSize,
      simulationSettings.memorySize
    )
  );

  const pra = new simulationSettings.pra();

  /**
   * Processing unit
   */
  const pu = new ProcessingUnit(
    new simulationSettings.dispatcher(),
    pra,
    mmu,
    new Memory(simulationSettings.memorySize),
    new Storage(simulationSettings.memorySize * 2)
  );

  // determine allocation mode
  const memoryAllocationMode: false | "eachTick" | "eachProcessTick" =
    simulationSettings.allocateMemoryRandomly;

  // Enable logging to the console
  pu.enableLogging = true;

  // render data on each tick
  pu.onTick = (pu) => {
    const queue = pu.dispatcher.getQueue();
    updateMiddleRightBoxContent(
      prepareProcessStack(queue as Array<SimulationProcess>)
    );
    updateMiddleLeftTableContent(updatePlannedQueue());

    // allocate memory randomly
    if(memoryAllocationMode) {
      switch(memoryAllocationMode) {
        case "eachTick":
          pu.readData(
            Math.floor(
              Math.random() *
                simulationSettings.pageCount *
                simulationSettings.frameSize
            )
          );
          break;
        case "eachProcessTick":
          if(pu.currentProcess) pu.readData(
            Math.floor(
              Math.random() *
                simulationSettings.pageCount *
                simulationSettings.frameSize
            )
          );
          break;
      }
    }
    updateRightBoxContent(prepareMemoryData(pu, pra));
  };

  /**
   * Processes that ended execution
   */
  const endedProcesses: Array<SimulationProcess> = [];

  // render data on process end
  pu.onProcessEnd = (process, pu) => {
    endedProcesses.push(process as SimulationProcess);
    //updateRightBoxContent(prepareProcessStack(endedProcesses, pu.time));
  };

  /**
   * Generates planned queue content with formatting etc.
   * @returns Planned queue content table
   */
  const updatePlannedQueue = () => {
    let content = [["AT", "Process", "BTL", "BT", "TET", "AET"]];
    processList.forEach((process) => {
      const btl = process.process.getBurstTimeLeft();
      content.push([
        process.arrivalTime < pu.time
          ? `{gray-fg}${process.arrivalTime.toString()}{/gray-fg}`
          : process.arrivalTime.toString(),
        process.process.name,
        pu.currentProcess === process.process
          ? `{green-fg}${btl}{/green-fg}`
          : btl === 0
          ? `{gray-fg}${btl}{/gray-fg}`
          : `{yellow-fg}${btl.toString()}{/yellow-fg}`,
        process.process.burstTime.toString(),
        process.process.getExecutionTime().toString(),
        (
          process.process.getExecutionTime() -
          process.process.getRelativeTime(process.arrivalTime)
        ).toString(),
      ]);
    });
    return content;
  };

  /**
   * Main simulation
   */
  const sim = new Simulation(
    pu,
    simulationSettings.tickTime,
    simulationSettings.maxTicks
  );
  sim.enableLogging = true;

  /**
   * Process generator
   */
  simulationSettings.processes.forEach((processSettings) => {
    const generator = ProcessGenerator;

    //checking settings and applying them
    if (processSettings.colors) generator.withColor(false);
    if (processSettings.prefix)
      generator.withNamePrefix(processSettings.prefix);
    if (processSettings.burstTime) {
      switch (processSettings.burstTime.mode) {
        case "random":
          generator.withRandomBurstTime(
            processSettings.burstTime.props[0],
            processSettings.burstTime.props[1]
          );
          break;
        case "fixed":
          generator.withFixedBurstTime(processSettings.burstTime.props[0]);
          break;
        case "incremental":
          generator.withIncrementalBurstTime(
            processSettings.burstTime.props[0],
            processSettings.burstTime.props[1]
          );
          break;
      }
    }
    if (processSettings.arrivalTime) {
      switch (processSettings.arrivalTime.mode) {
        case "random":
          generator.withRandomArrivalTime(
            processSettings.arrivalTime.props[0],
            processSettings.arrivalTime.props[1]
          );
          break;
        case "fixed":
          generator.withFixedArrivalTime(processSettings.arrivalTime.props[0]);
          break;
        case "incremental":
          generator.withIncrementalArrivalTime(
            processSettings.arrivalTime.props[0],
            processSettings.arrivalTime.props[1]
          );
          break;
      }
    }

    //generating processes
    const processes = generator.generate(processSettings.count);

    //logging
    Logger.logHeader(`Generating ${processSettings.count} processes`);

    processes.forEach((process) => {
      processList.push({
        process: process.process,
        arrivalTime: process.arrivalTime,
      });
      Logger.setPrefix(process.arrivalTime.toString());
      Logger.log(
        process.process.name + "; Burst time:" + process.process.burstTime
      );
    });

    // adding processes to the simulation
    processes.forEach((process) => {
      processCount++;
      sim.setProcess(process.process, process.arrivalTime);
    });
  });

  //updating planned queue even before first tick
  updateMiddleLeftTableContent(updatePlannedQueue());

  /**
   * Prepares process stack content. If tick is provided, it will be displayed
   * on the bottom of the stack as 'Last update' time.
   *
   * @param processes Processes to be displayed
   * @param tick Actual tick
   * @returns String to be displayed
   */
  const prepareProcessStack = (
    processes: Array<SimulationProcess>,
    tick?: number,
    displayFinishTime?: boolean
  ) => {
    let content = "";
    content += `Processes in stack: ${processes.length}/${processCount}\n`;
    processes.forEach((process) => {
      content += `${process.finishTime ? "[" + process.finishTime + "] " : ""}${
        process.name
      }; BT: ${process.burstTime}; AET: ${process.getRelativeTime(
        tick as number
      )}\n`;
    });

    if (tick) content += `\nLast update at: ${tick}`;
    return content;
  };

  updateMiddleRightBoxContent("");
  updateRightBoxContent("");

  // Main sim loop
  try {
    sim.run();
  } catch (e) {
    Logger.logHeader(`Error`);
    Logger.log(e);
  }

  return {simulation: sim};
};
