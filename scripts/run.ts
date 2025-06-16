import {RoundRobin} from "../src/models/dispatchers/RoundRobin";
import {FCFS} from "../src/models/dispatchers/FCFS";
import {FCLS} from "../src/models/dispatchers/FCLS"
import {SJF} from "../src/models/dispatchers/SJF";
import {FIFO} from "../src/models/pra/FIFO";
import {LFU} from "../src/models/pra/LFU";
import * as ui from "./ui";
import * as preparesim from "./preparesim";
import { Simulation } from "../src/models/Simulation";

const {render} = ui;
const {runSimulation} = preparesim;

/**
 * Base simulation settings
 * 
 * This is the base simulation settings that will be used to run the simulation.
 * Processes are generated based on this settings.
 * Possible bustTime / arrivalTime generators: 
 * - random [min, max]
 * - fixed [value]
 * - incremental [start, step]
 */
const simulationSettings = {
  /**
   * Dispatcher to use
   * RoundRobin, FCFS, FCLS, SJF
   */
  dispatcher: RoundRobin,

  /**
   * Time between ticks in ms
   * if 0 simulation would run in synchronous mode - program will open after the 
   * simulation is finished. It is better to use 1 instead of 0.
   */
  tickTime: 100,

  /**
   * Max ticks to run
   * if 0 or undefined, the simulation will run until the last process ends
   */
  maxTicks: 0,

  /**
   * Page replacement algorithm
   * LFU, FIFO
   */
  pra: LFU,

  /**
   * Memory size in bytes
   */
  memorySize: 0x10, //16

  /**
   * Frame / page size in bytes
   */
  frameSize: 0x2, //2

  /**
   * Page count in virtual memory (VM size = pageCount * frameSize)
   */
  pageCount: 0x10, //16

  /**
   * Memory allocation simulation mode
   * false | 'eachTick' | 'eachProcessTick'
   * false - no memory allocation simulation (default)
   * 'eachTick' - allocate memory randomly each PU tick
   * 'eachProcessTick' - allocate memory randomly each PU tick with active 
   *   process
   */
  allocateMemoryRandomly: 'eachTick',

  /**
   * List of processes types to generate by Process Generator
   */
  processes: [
    {
      /**
       * Process type prefix (final process name is prefix + number)
       */
      prefix: "Process",

      /**
       * Should add different CLI colors to process names 
       */
      colors: true,

      /**
       * Process burst time settings
       */
      burstTime: {

        /**
         * Generator mode
         */
        mode: "random",

        /**
         * Generator props (see above)
         */
        props: [5, 30],
      },

      /**
       * Arrival time generator settings
       */
      arrivalTime: {

        /**
         * Generator mode
         */
        mode: "random",

        /**
         * Generator props
         */
        props: [5, 90],
      },

      /**
       * Number of processes of this type to generate
       */
      count: 15,
    },
  ],
};

/**
 * Main loop starts here
 */
render();

/**
 * Main sim object
 */
let sim: Simulation|null = null 


const { simulation } = runSimulation(simulationSettings);
sim = simulation
ui.resetHandler(() => {
  sim?.stop();
  render();
  const {simulation} = runSimulation(simulationSettings);
  sim = simulation
});
