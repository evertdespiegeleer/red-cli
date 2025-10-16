export function biggestAbsolute(numbers: number[]): number {
	return numbers.reduce((max, n) => {
		if (Math.abs(n) > Math.abs(max)) {
			return n;
		}
		return max;
	}, 0);
}
