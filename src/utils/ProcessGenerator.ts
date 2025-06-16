import {GeneratedProcess} from "../types/GeneratedProcess";
import { SimulationProcess } from "../models/SimulationProcess";

/**
 * CLI Colors
 */
const colors = {
  black: {bg: "\x1b[40m", fg: "\x1b[30m"},
  red: {bg: "\x1b[41m", fg: "\x1b[31m"},
  green: {bg: "\x1b[42m", fg: "\x1b[32m"},
  yellow: {bg: "\x1b[43m", fg: "\x1b[33m"},
  blue: {bg: "\x1b[44m", fg: "\x1b[34m"},
  magenta: {bg: "\x1b[45m", fg: "\x1b[35m"},
  cyan: {bg: "\x1b[46m", fg: "\x1b[36m"},
  white: {bg: "\x1b[47m", fg: "\x1b[37m"},
  gray: {bg: "\x1b[100m", fg: "\x1b[90m"},
};

/**
 * Reset color sequence
 */
const RESET = "\x1b[0m";

export const ProcessGenerator = {
  /**
   * Default config copy
   */
  defaultConfig: {
    id: 0,
    namePrefix: "",
    burstTime: () => 10,
    arrivalTime: () => 10,
    color: () => ({fg: "", bg: ""}),
  },

  /**
   * Work config
   */
  config: {
    id: 0,
    namePrefix: "",
    burstTime: () => 10,
    arrivalTime: () => 10,
    color: () => ({fg: "", bg: ""}),
  },

  /**
   * Generators
   */
  generators: {
    random: (min: number = 0, max: number = 10) => {
      return () => {
        const minValue = min;
        const maxValue = max;
        return Math.floor(Math.random() * (maxValue - minValue) + minValue);
      };
    },
    fixed: (value: number) => {
      return () => value;
    },
    incremental: (start: number, step: number) => {
      let currentValue = start;
      return () => {
        currentValue += step;
        return currentValue;
      };
    },
    color: (useFg: boolean) => {
      const lastUsed: any = {
        bg: undefined,
        fg: undefined,
      }
      return () => {
        const useForeground = useFg;
        const getNextColor = (
          key: "bg" | "fg" = "bg",
        ) => {
          const colorsList = Object.keys(colors);
          const index = colorsList.indexOf(lastUsed[key] ?? "gray");
          let nextIndex = (index + 1) % colorsList.length
          if(key === 'bg' && colorsList[nextIndex] === (lastUsed.fg ?? "white")) {
            nextIndex = (index + 2) % colorsList.length;
          }
          const name = colorsList[nextIndex];  
          lastUsed[key] = name;
          return colors[name as keyof typeof colors][key];
        };

        

        return {
          fg: useForeground ? getNextColor("fg") : colors.white.fg,
          bg: getNextColor("bg"),
        };
      };
    },
  },

  /**
   * Sets burst time generator to random value
   * @param min Minimum value
   * @param max Maximum value
   * @returns Generator object for chaining
   */
  withRandomBurstTime(min: number, max: number) {
    this.config.burstTime = this.generators.random(min, max);
    return this;
  },

  /**
   * Sets burst time generator to incremental value
   * @param start Start value
   * @param step Step value
   * @returns Generator object for chaining
   */
  withIncrementalBurstTime(start: number, step: number) {
    this.config.burstTime = this.generators.incremental(start, step);
    return this;
  },

  /**
   * Sets burst time generator to fixed value
   * @param value Fixed value
   * @returns Generator object for chaining
   */
  withFixedBurstTime(value: number) {
    this.config.burstTime = this.generators.fixed(value);
    return this;
  },

  /**
   * Sets arrival time generator to random value
   * @param min Minimum value
   * @param max Maximum value
   * @returns Generator object for chaining
   */
  withRandomArrivalTime(min: number, max: number) {
    this.config.arrivalTime = this.generators.random(min, max);
    return this;
  },

  /**
   * Sets arrival time generator to incremental value
   * @param start Start value
   * @param step Step value
   * @returns Gemerator object for chaining
   */
  withIncrementalArrivalTime(start: number, step: number) {
    this.config.arrivalTime = this.generators.incremental(start, step);
    return this;
  },

  /**
   * Sets arrival time generator to fixed value
   * @param value Fixed value
   * @returns Generator object for chaining
   */
  withFixedArrivalTime(value: number) {
    this.config.arrivalTime = this.generators.fixed(value);
    return this;
  },

  /**
   * Sets color generator to use pseudo-random colors for every process
   * @param useFg Use foreground color
   * @returns Generator object for chaining
   */
  withColor(useFg: boolean) {
    this.config.color = this.generators.color(useFg);
    return this;
  },

  /**
   * Sets name prefix
   * @param prefix Prefix to add to process name
   * @returns Generator object for chaining
   */
  withNamePrefix(prefix: string) {
    this.config.namePrefix = prefix;
    return this;
  },

  /**
   * Generates processes and resets the generator config
   * @param count Process count
   * @returns Generated processes
   */
  generate(count: number): Array<GeneratedProcess> {
    const processes: Array<GeneratedProcess> = [];
    for (let i = 0; i < count; i++) {
      const {fg, bg} = this.config.color();
      const process = new SimulationProcess(this.config.burstTime(), fg + bg + this.config.namePrefix + " " + i + RESET);
      processes.push({
        process: process,
        arrivalTime: this.config.arrivalTime(),
      });
    }
    // Reset config to default
    this.config = this.defaultConfig
    return processes;
  },
};
