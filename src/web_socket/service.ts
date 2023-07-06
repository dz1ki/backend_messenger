import { JwtPayload } from "jsonwebtoken";
import sequelize from "../models";
import { getGroupsUser } from "./helper";
import { Message } from "../models/message";
import { ParramListLastMessage, ReqMessageDTO } from "./type";

export const addAllGroupUser = async (client: JwtPayload) => {
  const { id } = client;
  const userGroupArr = [];
  const userGroups = await getGroupsUser(id);

  userGroups.forEach((groupe) => {
    userGroupArr.push(groupe.groupId);
  });
  client.groups = userGroupArr;
};

export const listLastMessage = async (
  parseMessage: ReqMessageDTO<ParramListLastMessage>,
  client: JwtPayload
) => {
  const { id } = client;
  const { limit, page } = parseMessage.params;
  const offset = (page - 1) * limit;
  const result = await sequelize.query(
    `SELECT sender_id, receiver_id, group_id, created_at
          FROM messages
          WHERE (sender_id = ${id} OR receiver_id = ${id} OR group_id IN (
              SELECT group_id
              FROM users_groups
              WHERE user_id = ${id}
          ))
          GROUP BY sender_id, receiver_id, group_id, created_at
          ORDER BY created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
      `,
    { raw: true, nest: true, model: Message }
  );
  return { statusCode: 200, messages: result };
};