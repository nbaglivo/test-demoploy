import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
} from 'react';
import { motion } from 'motion/react';
import useMeasure from 'react-use-measure';

export default function Demo() {
  return <TabsExample />;
}

const OptionGroupContext = createContext<{
	value: number | string;
	onValueChange: (v: number | string) => void;
	registerBounds: (value: number | string, bounds: DOMRect | null) => void;
}>(
	null as unknown as {
		value: number | string;
		onValueChange: (v: number | string) => void;
		registerBounds: (value: number | string, bounds: DOMRect | null) => void;
	},
);

function OptionGroup({
	children,
	defaultValue,
}: PropsWithChildren<{
	defaultValue: number | string;
}>) {
	const [value, setValue] = useState(defaultValue);
	const [refContainer, containerBounds] = useMeasure();

	const [boundsByValue, setBoundsByValue] = useState<
		Record<number | string, DOMRect>
	>({});

	const registerBounds = useCallback(
		(v: number | string, bounds: DOMRect | null) => {
			setBoundsByValue((prev) =>
				bounds
					? { ...prev, [v]: bounds }
					: (() => {
							const next = { ...prev };
							delete next[v];
							return next;
						})(),
			);
		},
		[],
	);

	const bounds = boundsByValue[value];

	function onValueChange(v: number | string) {
		setValue(v);
	}

	return (
		<OptionGroupContext.Provider
			value={{ value, onValueChange, registerBounds }}
		>
			<motion.div
				className="relative inline-flex overflow-hidden"
				ref={refContainer}
			>
				<motion.div
					className="absolute left-0 top-[8px] bottom-[8px] rounded-[2px] bg-zinc-700"
					animate={{
						x: bounds?.x ? bounds.x - containerBounds.x : 0,
						width: bounds?.width ? bounds.width : 0,
					}}
					transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
				/>
				{children}
			</motion.div>
		</OptionGroupContext.Provider>
	);
}

function Option({
	children,
	value,
}: PropsWithChildren<{
	value: number | string;
}>) {
	const { registerBounds, onValueChange } = useContext(OptionGroupContext);
	const [ref, bounds] = useMeasure();

	useEffect(() => {
		registerBounds(value, bounds as unknown as DOMRect);
		return () => registerBounds(value, null as unknown as DOMRect);
	}, [value, bounds, registerBounds]);

	return (
		<button
			ref={ref}
			type="button"
			className="relative z-10 cursor-pointer border-none bg-transparent"
			onClick={() => onValueChange(value)}
		>
			{children}
		</button>
	);
}


function TabsExample() {
	return (
		<div className="flex flex-col gap-4 text-black dark:text-white">
			<div className="text-md font-bold">Tabs</div>
			<div className="bg-black text-white px-2 rounded-[6px]">
				<OptionGroup defaultValue={0}>
					<Option value={0}>
						<div className="flex items-center gap-2 p-2">Projects</div>
					</Option>
					<Option value={1}>
						<div className="flex items-center gap-2 p-2">Writing</div>
					</Option>
					<Option value={2}>
						<div className="flex items-center gap-2 p-2">About</div>
					</Option>
				</OptionGroup>
			</div>
		</div>
	);
}
