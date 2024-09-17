import React, { useState } from "react";
import {
	Alert,
	View,
	ScrollView,
	Text,
	StyleSheet,
	Dimensions,
	Tooltip,
	TouchableOpacity,
} from "react-native";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";
import useDataStore from "../src/stores/DataStore";

const { width } = Dimensions.get("window");

const GanttChartEnhanced = ({ requests }) => {
	const [tooltip, setTooltip] = useState(null);
	const [requestColor, setRequestColor] = useState("#000000");
	const [filter, setFilter] = useState(0);
	let currentTask = 0;

	const [projectName, setProjectName] = useState(
		useDataStore((state) => state.currentProject)
	);

	const generateColor = () => {
		const randomColor = Math.floor(Math.random() * 16777215).toString(16);
		setRequestColor(`#${randomColor}`);
	};

	const chartWidth = width - 60; // Adjust as needed 40
	const requestHeight = 30;
	const requestMargin = 20;	// 10
	const daysToAdd = 30;
	// Compute maximum date range
	const startDate = Math.min(
		...requests.map((request) => new Date(request.start).getTime()),
	);
	// const endDate = Math.max(
	// 	...requests.map((request) => new Date(request.end).getTime()),
	// );
	const endDate = Math.max(
		// ...requests.map((request) => new Date(request.end).getTime()),
		...requests.map((request) => new Date(request.maxdate).getTime()),
	);

	const dateRange = endDate - startDate;

	// Number of gridlines
	const numGridlines = 4; // 10

	// Open - Yellow
	// Awarded - Green

	return (
		<View className="flex-1 bg-white w-full">
			<View className="items-center pb-2 pt-2">
				<Text>
					<Text className="text-green-500 text-2xl font-bold">WORK</Text>
					<Text className="text-black text-2xl font-bold">SIDE</Text>
				</Text>
				<View>
					<Text className="text-black text-xl font-bold">
						{projectName}
					</Text>
					</View>
				{/* <Text>
					<Text className="text-black text-xl font-bold">Requests</Text>
				</Text> */}
			</View>
			<ScrollView style={{ maxHeight: "80%" }}>
				{/* <View className="pt-10 p-5 bg-white"> */}
				<View className="pt-2 bg-white w-full">
					{/* <View style={styles.container}> */}
					<Svg
						// width={chartWidth}
						width={width}
						height={requests.length * (requestHeight + requestMargin) + 40}
					>
						{/* Draw gridlines */}
						{[...Array(numGridlines).keys()].map((i) => {
							const x = (i / (numGridlines - 1)) * chartWidth;
							return (
								<Line
									key={i}
									x1={x}
									y1="0"
									x2={x}
									y2={requests.length * (requestHeight + requestMargin)}
									// stroke="#e0e0e0"
									stroke="black"
									strokeWidth="2"
								/>
							);
						})}

						{/* Draw requests */}
						{requests.map((request, index) => {
							if (filter === 1 && request.status !== "AWARDED") {
								return null;
							}
							if (filter === 2 && request.status !== "OPEN") {
								return null;
							}
							const startX =
								((new Date(request.start).getTime() - startDate) / dateRange) *
								chartWidth;
							const endX =
								((new Date(request.end).getTime() - startDate) / dateRange) *
								chartWidth;
							const currentIndex = currentTask;
							currentTask = currentTask + 1;
							return (
								<React.Fragment key={request.id}>
									<Rect
										x={startX}
										y={currentIndex * (requestHeight + requestMargin)}
										width={endX - startX}
										height={requestHeight}
										fill={request.color}
										// fill="#3B82F6"
										onPress={() =>
											setTooltip({
												x: startX,
												y: currentIndex * (requestHeight + requestMargin),
												content: request.details,
											})
										}
									/>
									<SvgText
										x={startX + 5}
										y={
											currentIndex * (requestHeight + requestMargin) +
											requestHeight / 2
										}
										fontSize="14"
										fontWeight={600}
										// fill="white"
										fill="black"
									>
										{request.name}
									</SvgText>
								</React.Fragment>
							);
						})}

						{/* Draw labels */}
						{[...Array(numGridlines).keys()].map((i) => {
							const x = (i / (numGridlines - 1)) * chartWidth;
							return (
								<SvgText
									key={i}
									x={x + 5}
									y={requests.length * (requestHeight + requestMargin) + 20}
									// y={currentTask * (requestHeight + requestMargin) + 20}
									fontSize="12"
									fill="black"
								>
									{new Date(
										startDate + (i / (numGridlines - 1)) * dateRange,
									).toLocaleDateString()}
								</SvgText>
							);
						})}
					</Svg>

					{tooltip && (
						<View
							style={[
								styles.tooltip,
								{ left: tooltip.x + 20, top: tooltip.y },	// tooltip.y - 10
							]}
						>
							<Text style={styles.tooltipText}>{tooltip.content}</Text>
						</View>
					)}
				</View>
			</ScrollView>
			{/* <View className="flex flex-row justify-between space-x-4 p-4"> */}
			<View className="flex flex-row justify-between p-2">
				<TouchableOpacity
					className={
						"bg-lime-200 p-0 rounded-lg w-28 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					}
					onPress={() => {
						setFilter(0);
						setTooltip(null);
						// Alert.alert("Show All");
					}}
				>
					<Text className="text-base font-bold text-black">All</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className={
						"bg-green-500 p-0 rounded-lg w-32 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					}
					onPress={() => {
						setFilter(1);
						setTooltip(null);
						// Alert.alert("Show Awarded");
					}}
				>
					<Text className="text-base font-bold text-black">Awarded</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className={
						"bg-yellow-300 p-0 rounded-lg w-28 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					}
					onPress={() => {
						setFilter(2);
						setTooltip(null);
						// Alert.alert("Show Open");
					}}
				>
					<Text className="text-base font-bold text-black">Open</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingTop: 40,
		backgroundColor: "#f5f5f5",
	},
	tooltip: {
		position: "absolute",
		backgroundColor: "#333",
		padding: 5,
		borderRadius: 5,
		zIndex: 1,
	},
	tooltipText: {
		color: "white",
		fontSize: 12,
	},
});

export default GanttChartEnhanced;
