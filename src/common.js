export const getRoodId = (userId1, userId2) => {
	const sortIds = [userId1, userId2].sort();
	const roomId = sortIds.join("-");

	return roomId;
};
