import { MemoryError } from "../errors/MemoryError";

/**
 * Storage memory representation class
 */
export class Storage {

  /**
   * Storage data
   */
  data: Map<number, number> = new Map();

  /**
   * Storage size
   */
  public size: number;

  /**
   * Constructs a new storage memory
   * @param size Storage size in bytes
   */
  public constructor(size: number = 0x4000) {
    this.size = size;
    for (let i = 0; i < size; i++) {
      this.data.set(i, i % 256);
    }
  }

  /**
   * Reads from storage
   * @param address Addres to read
   * @returns Read value
   * @throws MemoryError if address is out of bounds
   */
  public read(address: number): number {
    if(address > this.size) throw new MemoryError("Storage address out of bounds");
    return this.data.get(address) ?? 0;
  }

  /**
   * Writes to storage
   * @param address Addres to write to
   * @param value Value to write
   * @throws MemoryError if address is out of bounds
   */
  public write(address: number, value: number): void {
    if(address > this.size) throw new MemoryError("Storage address out of bounds");
    this.data.set(address, value % 256);
  }
}