export function Browser(props: { path: string }) {
	return (
		<box
			borderColor="cyan"
			borderStyle="rounded"
			flexGrow={1}
			title={` ${props.path || "[root]"} `}
			titleAlignment="center"
			flexDirection="row"
		></box>
	);
}
