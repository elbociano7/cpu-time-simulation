import {PageReplacementAlgorithm} from "../../abstract/PageReplacementAlgorithm";
import {Logger} from "../../utils/Logger";
import {MemoryManagementUnit} from "../MemoryManagementUnit";

export class LFU extends PageReplacementAlgorithm {
  public usedFrames: number[] = [];

  public frameCount?: number;

  public frequencyMap: Map<number, number> = new Map();

  public onHit(mmu: MemoryManagementUnit, memaddress: number): number {
    const {page, offset} = mmu.pageTable.getPageAddress(memaddress);
    const frame = mmu.pageTable.pageTable[page].frame;
    this.frequencyMap.set(frame, (this.frequencyMap.get(frame) ?? 0) + 1);
    return frame;
  }

  public onMiss(mmu: MemoryManagementUnit, memaddress: number): number {
    if (!this.frameCount)
      this.frameCount = Math.floor(
        mmu.pageTable.memorySize / mmu.pageTable.frameSize
      );

    if (this.usedFrames.length < this.frameCount) {
      for (let i = 0; i < this.frameCount; i++) {
        if (!this.usedFrames.includes(i)) {
          this.usedFrames.push(i);
          this.frequencyMap.set(i, 1);
          return i;
        }
      }
    }

    const lastFrame = this.usedFrames.shift() ?? 0;

    this.usedFrames.push(lastFrame);
    this.frequencyMap.set(lastFrame, 1);
    return lastFrame;
  }

  public logState(): string {
    let content = "Frequencies: ";
    this.frequencyMap.forEach((value, key) => {
      content += `${key}: ${value}; `;
    });
    return content;
  }
}
