require('dotenv').config();
const Trek = require('../models/trek');

const getAllTrek = async () => {
    try {
        console.log("In trek");
        const data = await Trek.find();
        return data;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                message: 'Error fetching treks'
            }
        };
    }
};

// get valid date treks with valid batches only
const getFilterTrek = async () => {
    try {
        console.log("In filter trek");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const data = await Trek.aggregate([
            {
                $match: {
                    status: "Active"
                }
            },
            {
                $project: {
                    _id: 1,
                    eventName: 1,
                    fees: 1,
                    coverImage: 1,
                    difficulty: 1,
                    duration: 1,
                    trekFrom: 1,
                    batches: {
                        $filter: {
                            input: "$batches",
                            as: "batch",
                            cond: {
                                $and: [
                                    { $gte: ["$$batch.eventDate", today] },
                                    { $eq: ["$$batch.status", "Active"] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    "batches.0": { $exists: true }
                }
            },
            {
                $project: {
                    _id: 1,
                    eventName: 1,
                    fees: 1,
                    coverImage: 1,
                    difficulty: 1,
                    duration: 1,
                    trekFrom: 1,
                    batches: {
                        $sortArray: {
                            input: "$batches",
                            sortBy: { eventDate: 1 }
                        }
                    }
                }
            }
        ]);
        return data;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                message: 'Error fetching filter treks'
            }
        };
    }
};

// get speial treks (specialEvent: true) and valid date with valid batches trek only
const getSpecialTrek = async () => {
    try {
        console.log("In specialtrek");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const data = await Trek.aggregate([
            {
                $match: {
                    status: "Active"
                }
            },
            {
                $project: {
                    _id: 1,
                    eventName: 1,
                    altitude: 1,
                    description: 1,
                    coverImage: 1,
                    difficulty: 1,
                    duration: 1,
                    trekFrom: 1,
                    specialEvent: 1,
                    batches: {
                        $filter: {
                            input: "$batches",
                            as: "batch",
                            cond: {
                                $and: [
                                    { $gte: ["$$batch.eventDate", today] },
                                    { $eq: ["$$batch.status", "Active"] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    specialEvent: true,
                    "batches.0": { $exists: true }
                }
            },
            {
                $project: {
                    _id: 1,
                    eventName: 1,
                    altitude: 1,
                    description: 1,
                    coverImage: 1,
                    difficulty: 1,
                    duration: 1,
                    trekFrom: 1,
                    specialEvent: 1,
                    batches: {
                        $sortArray: {
                            input: "$batches",
                            sortBy: { eventDate: 1 }
                        }
                    }
                }
            }
        ]);

        return data;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                message: 'Error fetching special treks'
            }
        };
    }
};
module.exports = { getAllTrek, getFilterTrek, getSpecialTrek };