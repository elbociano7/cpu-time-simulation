export const CopyBlock = (
  source: Map<number, number>,
  destination: Map<number, number>,
  sourceAddress: number,
  destinationAddress: number,
  size: number
) => {
  for (let i = 0; i < size; i++) {
    destination.set(destinationAddress + i, source.get(sourceAddress + i) ?? 0);
  }
};
