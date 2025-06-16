import { PageReplacementAlgorithm } from "../../abstract/PageReplacementAlgorithm";
import { Logger } from "../../utils/Logger";
import { MemoryManagementUnit } from "../MemoryManagementUnit";


export class FIFO extends PageReplacementAlgorithm {

  public usedFrames: number[] = [];

  public frameCount?: number;

  public onHit(mmu: MemoryManagementUnit, memaddress: number): number {
    const {page, offset} = mmu.pageTable.getPageAddress(memaddress);
    const frame = mmu.pageTable.pageTable[page].frame
    return frame
  }

  public onMiss(mmu: MemoryManagementUnit, memaddress: number): number {
    if(!this.frameCount) this.frameCount = Math.floor(mmu.pageTable.memorySize / mmu.pageTable.frameSize); 

    
    if(this.usedFrames.length < this.frameCount) {
      for(let i = 0; i < this.frameCount; i++) {
        if(!this.usedFrames.includes(i)) {
          this.usedFrames.push(i);
          Logger.log(`Frame ${i} used`);
          return i;
        }
      }
    } 
    Logger.log(`No free frames`);

    const lastFrame = this.usedFrames.shift() ?? 0;
    this.usedFrames.push(lastFrame);
    Logger.log(`Frame ${lastFrame} reassigned`);
    return lastFrame;
  }

  public logState(): string {
      return "";
  }

}