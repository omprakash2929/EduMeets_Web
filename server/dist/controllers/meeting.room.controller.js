"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAttendee = exports.joinMeetingRoom = exports.createMeetingRoom = exports.checkExistMeetingRoom = void 0;
const meeting_model_1 = __importDefault(require("../models/meeting.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const meeting_room_model_1 = __importDefault(require("../models/meeting.room.model"));
const utils_1 = require("../utils");
const moment_1 = __importDefault(require("moment"));
const meeting_stats_controller_1 = require("./meeting.stats.controller");
const mongoose_1 = __importDefault(require("mongoose"));
// import { io } from "../server";
const checkExistMeetingRoom = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meetingRoom = yield meeting_room_model_1.default.findOne({ session_id: +sessionId }).populate("meeting");
        if (meetingRoom)
            return meetingRoom;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.checkExistMeetingRoom = checkExistMeetingRoom;
const instantMeetingHandler = (sessionId, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingPMI = yield user_model_1.default.findOne({
            pmi: +sessionId,
        });
        if (!existingPMI) {
            return next(new utils_1.ErrorFormat(`Personal meeting with id ${sessionId} not found`, 404));
        }
        const meetingRoom = yield meeting_room_model_1.default.create({
            meeting_type: "instant",
            session_id: +sessionId,
        });
        return res.status(200).json({
            status: "success",
            data: meetingRoom,
        });
    }
    catch (error) {
        next(new utils_1.ErrorFormat(error.message, 500));
    }
});
exports.createMeetingRoom = (0, utils_1.asyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId, passcode, userId, meetingType } = req.body;
    if (meetingType === "instant")
        return yield instantMeetingHandler(sessionId, res, next);
    const meeting = yield meeting_model_1.default.findOne({ session_id: sessionId }).populate("participants");
    if (!meeting)
        return next(new utils_1.ErrorFormat(`Meeting with id ${sessionId} not found`, 404));
    const meetingStatus = (0, utils_1.getMeetingStatus)(meeting.start_time, meeting.end_time);
    if (meeting.status !== meetingStatus) {
        meeting.status = meetingStatus;
        yield meeting.save();
    }
    if (meeting.status === "ended")
        return next(new utils_1.ErrorFormat("Meeting has ended", 400));
    if (meeting.passcode_required && passcode !== meeting.passcode) {
        return next(new utils_1.ErrorFormat("Please provide a valid passcode", 400));
    }
    if (!meeting.waiting_room && (!userId || meeting.host.toString() !== userId)) {
        if (meetingStatus === "upcoming") {
            return res.status(200).json({
                waiting_room: false,
                meeting,
            });
        }
    }
    if (meeting.require_confirm && (!userId || meeting.host.toString() !== userId)) {
        return res.status(200).json({
            require_confirm: true,
            meeting,
        });
    }
    const existingRoom = yield (0, exports.checkExistMeetingRoom)(sessionId);
    if (existingRoom) {
        yield (0, meeting_stats_controller_1.createMeetingStats)({
            roomId: `${existingRoom._id}`,
            meetingId: meeting._id,
            userId,
            participants: [meeting.host, ...meeting.participants],
        });
        return res.status(200).json({
            status: "success",
            data: existingRoom,
        });
    }
    const meetingRoom = yield meeting_room_model_1.default.create({
        meeting_type: "scheduled",
        session_id: +sessionId,
        meeting: meeting._id,
    });
    if (!meetingRoom)
        throw new Error("Fail to create meeting room");
    const stat = yield (0, meeting_stats_controller_1.createMeetingStats)({
        roomId: `${meetingRoom._id}`,
        meetingId: `${meeting._id}`,
        userId,
        participants: [meeting.host, ...meeting.participants],
    });
    if (!stat)
        return next(new utils_1.ErrorFormat("Fail to create meeting stats", 500));
    return res.status(200).json({
        status: "success",
        data: meetingRoom,
    });
}));
const populateMeetingRoom = (meetingRoom, user, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        meetingRoom = yield meetingRoom.populate({
            path: "attendees",
            select: "full_name photo",
        });
        meetingRoom = yield meetingRoom.populate({
            path: "meeting",
            populate: [
                {
                    path: "participants",
                    select: "full_name photo",
                },
                {
                    path: "host",
                    select: "full_name photo",
                },
            ],
        });
        if (meetingRoom.meeting_type === "scheduled" &&
            (((_a = meetingRoom === null || meetingRoom === void 0 ? void 0 : meetingRoom.meeting) === null || _a === void 0 ? void 0 : _a.participants.find((partipant) => (partipant === null || partipant === void 0 ? void 0 : partipant._id.toString()) === user._id.toString())) ||
                ((_c = (_b = meetingRoom === null || meetingRoom === void 0 ? void 0 : meetingRoom.meeting) === null || _b === void 0 ? void 0 : _b.host) === null || _c === void 0 ? void 0 : _c._id.toString()) === user._id.toString())) {
            const stats = yield (0, meeting_stats_controller_1.updateMeetingStats)({
                action: "join_meeting",
                roomId: `${meetingRoom._id}`,
                userId: `${user._id}`,
            });
            if (!stats)
                return next(new utils_1.ErrorFormat("Fail to update meeting stats", 500));
        }
        return res.status(200).json({
            status: "success",
            data: meetingRoom,
        });
    }
    catch (error) {
        return next(new utils_1.ErrorFormat(error.message, 500));
    }
});
const joinMeetingRoom = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const existUser = req.user;
    if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
        return next(new utils_1.ErrorFormat(`Invalid meeting room id ${roomId}`, 400));
    }
    const meetingRoom = yield meeting_room_model_1.default.findById(roomId).exec();
    if (!meetingRoom)
        return next(new utils_1.ErrorFormat(`Meeting room with id ${roomId} not found`, 404));
    const isAttendeeExist = meetingRoom.attendees.some((attendee) => attendee.toString() === existUser._id.toString());
    if (isAttendeeExist) {
        return yield populateMeetingRoom(meetingRoom, existUser, res, next);
    }
    meetingRoom.attendees.push(existUser._id);
    yield meetingRoom.save();
    return yield populateMeetingRoom(meetingRoom, existUser, res, next);
});
exports.joinMeetingRoom = joinMeetingRoom;
const removeAttendee = (roomId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meetingRoom = yield meeting_room_model_1.default.findById(roomId);
        if (!meetingRoom) {
            throw new Error(`Meeting room with id ${roomId} not found`);
        }
        const newAttendees = meetingRoom.attendees.filter((attendee) => attendee.toString() !== userId);
        if (newAttendees.length === 0) {
            const updatedMeeting = yield meeting_model_1.default.findOne({ session_id: meetingRoom.session_id });
            if (meetingRoom.meeting_type === "scheduled" &&
                updatedMeeting &&
                (0, moment_1.default)(updatedMeeting.end_time).isBefore((0, moment_1.default)())) {
                updatedMeeting.status = "ended";
                yield updatedMeeting.save();
            }
            if (meetingRoom.meeting_type === "instant") {
                yield meeting_room_model_1.default.findOneAndDelete({ session_id: meetingRoom.session_id });
            }
        }
        meetingRoom.attendees = newAttendees;
        yield meetingRoom.save();
        return meetingRoom;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.removeAttendee = removeAttendee;
