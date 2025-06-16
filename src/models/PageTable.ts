export class PageTable {

  /**
   * Physical emmory size in bytes
   */
  public memorySize: number;

  /**
   * Pages count in virtual memory
   */
  public pageCount: number;

  /**
   * Frame size
   */
  public frameSize: number;

  /**
   * Page table data
   */
  public pageTable: Record<number, {
    valid: boolean;
    frame: number;
    props: Object;
  }> = [];

  /**
   * 
   * @param pageCount Pages count in virtual memory
   * @param frameSize Frame size in bytes
   * @param memorySize Memory size in bytes
   */
  public constructor(pageCount: number = 8, frameSize: number = 0x1000, memorySize: number = 0x4000) {
    this.pageCount = pageCount;
    this.frameSize = frameSize;
    this.memorySize = memorySize;
    for (let i = 0; i < pageCount; i++) {
      this.pageTable[i] = {
        valid: false,
        frame: 0,
        props: {},
      };
    }
  }

  /**
   * Assigns page to frame in pagetable
   * @param page Page to assign
   * @param frame Frame to be assigned
   */
  public assignPageToFrame(page: number, frame: number): void {
    const pageObject = this.pageTable[page];
    const oldPage = Object.entries(this.pageTable).find(([key, value]) => (value.valid === true && value.frame === frame));
    if (oldPage) {
      const [oldPageKey, oldPageValue] = oldPage;
      oldPageValue.valid = false;
    }
    pageObject.frame = frame;
    pageObject.valid = true;
  }

  /**
   * Assigns custom props to page. May be used in pra algorithms.
   * @param page Page to assign props to
   * @param props Custom props to assign to page
   */
  public assignProps(page: number, props: Object): void {
    const pageObject = this.pageTable[page];
    Object.assign(pageObject.props, props);
  }

  /**
   * Gets page number and offset from virtual address
   * @param address Address to translate
   * @returns Page address and offset
   */
  getPageAddress(address: number): {page: number, offset: number} {
    return {
      page: Math.floor(address / this.frameSize),
      offset: address % this.frameSize,
    };

  }
}