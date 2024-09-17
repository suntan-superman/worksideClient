import React from "react";
import { SafeAreaView, ScrollView, Text } from "react-native";
import { useRoute } from "@react-navigation/native";

import GanttChartEnhanced from "./GanttChartEnhanced";

const GanttScreenEnhanced = () => {
	const route = useRoute();

  const requests = route.params.requests;

	return (
		<SafeAreaView className="flex-1">
			<ScrollView horizontal>
				<GanttChartEnhanced requests={requests} />
			</ScrollView>
		</SafeAreaView>
	);
};

export default GanttScreenEnhanced;
