import { MemoryError } from "../errors/MemoryError";

/**
 * Memory representation class
 */
export class Memory {
  /**
   * Memory data
   */
  public memory: Map<number, number> = new Map();

  /**
   * Memory size in bytes
   */
  public size: number;

  /**
   * Constructs a new memory
   * @param size Memory size in bytes
   */
  public constructor(size: number = 0x4000) {
    this.size = size;
    for (let i = 0; i < size; i++) {
      this.memory.set(i, i % 256);
    }
  }

  /**
   * Memory read
   * @param address Address to read
   * @returns Read value
   * @throws MemoryError if address is out of bounds
   */
  public read(address: number): number {
    if(address > this.size) throw new MemoryError("Address out of bounds");
    return this.memory.get(address) ?? 0;
  }

  /**
   * Memory write
   * @param address Address to write
   * @param value Value to write
   * @throws MemoryError if address is out of bounds
   */
  public write(address: number, value: number): void {
    if(address > this.size) throw new MemoryError("Address out of bounds");
    this.memory.set(address, value % 256);
  }
}