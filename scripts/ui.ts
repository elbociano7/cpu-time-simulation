import blessed from "blessed";
import { Logger } from "../src/utils/Logger";

/**
 * Second helper script that handles `blessed` UI functionality.
 */

/**
 * Main screen
 */
export const screen = blessed.screen({
  title: "CPU Sim",
  smartCSR: true,
});

/**
 * Left box settings
 */
const tableBox = blessed.box({
  label: "Processes in simulation",
  parent: screen,
  top: 0,
  left: "25%",
  width: "25%",
  height: "90%",
  border: {
    type: "line",
  },
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  keys: true,
  padding: 1
});

export const leftBox = blessed.log({
  label: "Simulation logs",
  parent: screen,
  top: 0,
  left: 0,
  width: "25%",
  height: "90%",
  tags: true,
  border: {
    type: "line",
  },
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  keys: true,
});

/**
 * Middle left box settings
 */
export const middleLeftBox = blessed.table({
  parent: tableBox,
  width: "100%-4",
  tags: true,
  border: {
    type: "line",
  },
  mouse: true,
  keys: true,
});

export const bottomBox = blessed.box({
  label: "Help",
  parent: screen,
  top: "90%",
  left: 0,
  width: "100%",
  height: "10%",
  content:
    "Press 'q' to quit; Press 'r' to reset;AT - Arrival time; BTL - Burst time left; BT - Burst time; TET - Total execution time; AET - Arrival-execution time",
  tags: true,
  border: {
    type: "line",
  },
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  keys: true,
});

/**
 * Middle right box settings
 */
export const middleRightBox = blessed.box({
  label: "Dispatcher's queue",
  parent: screen,
  top: 0,
  left: "50%",
  width: "25%",
  height: "90%",
  content: "Dispatcher's queue. \nPress 'q' to quit",
  tags: true,
  border: {
    type: "line",
  },
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  keys: true,
});

/**
 * Right box settings
 */
export const rightBox = blessed.box({
  label: "Virtual memory",
  parent: screen,
  top: 0,
  left: "75%",
  width: "25%",
  height: "90%",
  title: "Processes",
  content: "",
  tags: true,
  border: {
    type: "line",
  },
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  keys: true,
});

/**
 * Custom logger to display log messages in the log box
 * @param args Log arguments
 */
export const customLogger = (...args: any[]) => {
  const message = args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
    )
    .join(" ");

  leftBox.log(message);
  screen.render();
};

Logger.customLogger = customLogger;

// Exits the program on escape/q/C-c key
screen.key(["escape", "q", "C-c"], () => {
  return process.exit(0);
});

let onReset = () => {}

export const resetHandler = (fun: () => any) => {
  onReset = fun;
} 

screen.key(["r"], () => {
  leftBox.setContent("");
  onReset();
 });

/**
 * Main render function
 */
export const render = () => {
  screen.render();
};

/**
 * Updates middle right box content
 * @param string Contents
 */
export const updateMiddleRightBoxContent = (string: string) => {
  middleRightBox.setContent(string);
  screen.render();
};

/**
 * Updates middle left box content
 * @param string Contents
 */
export const updateMiddleLeftTableContent = (data: Array<Array<string>>) => {
  middleLeftBox.setData(data);
  screen.render();
};

/**
 * Updates right box content
 * @param string Contents
 */
export const updateRightBoxContent = (string: string) => {
  rightBox.setContent(string);
  screen.render();
};
