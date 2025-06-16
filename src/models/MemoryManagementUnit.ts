import { PageTable } from "./PageTable";

export class MemoryManagementUnit {
  
  /**
   * Page table
   */
  public pageTable: PageTable

  /**
   * Constructs new MMU
   * @param pageTable Page table
   */
  public constructor(pageTable: PageTable) {
    this.pageTable = pageTable;
  }

  /**
   * 
   * @param address Virtual address to translate
   * @returns Physical memory address or false if address is not mapped
   */
  public translate(address: number): number|false { 
   const {page, offset} = this.pageTable.getPageAddress(address);
   const pageObject = this.pageTable.pageTable[page];
   if(pageObject.valid) {
     return pageObject.frame * this.pageTable.frameSize + offset;
   } else {
     return false;
   }
  }

}