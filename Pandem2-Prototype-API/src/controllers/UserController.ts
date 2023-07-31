/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { App } from '../app';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IUser, UserModel } from '../models/user';
import { IListQueryParams } from '../server/interfaces/route';
import { Bcrypt } from '../server/helpers/bcrypt';
import * as _ from 'lodash';
import { IRole, RoleModel } from '../models/role';
import { pipeline } from 'stream';
import * as util from 'util';
import * as fs from 'fs';
import { mkdir } from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { getSessionByAuthToken } from '../components/helpers';
import * as Path from 'path';
import ExcelJS from 'exceljs';
import * as stream from 'stream';
import excelFileUserValidationSchema from '../validationSchemas/userExcelFile.config.schema.json';
import mongoose from 'mongoose';

/**
 * Retrieve User list
 * @param request
 * @param reply
 */
export const retrieveUserList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const responseData: {
      data?: IUser[],
      metadata?: any
    } = {
      metadata: {}
    };

    const queryParams = request.query as IListQueryParams;
    const users: IUser[] = await UserModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );

    responseData.data = users;

    const rolesToRetrieve = new Set();
    users.forEach((user) => rolesToRetrieve.add(user.roleId));

    const roles: IRole[] = await RoleModel.find(
      {
        _id: {
          '$in': [...rolesToRetrieve]
        }
      },
      null,
      {
        lean: true
      });

    responseData.metadata.roles = roles;

    return reply.send(responseData);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve User list');

    throw err;
  }
};

/**
 * Retrieve User count
 * @param request
 * @param reply
 */
export const retrieveUserCount = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const count = await UserModel.countDocuments({});
    const responseData = {
      count: count
    };

    return reply.send(responseData);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve User count');

    throw err;
  }
};


/**
 * Create User instance
 * @param request
 * @param reply
 */
export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const bcrypt = new Bcrypt(_.get(App, 'serviceConfig.bcrypt.saltRounds')!);
    const payload: IUser = request.body as IUser;

    // check if email is already used
    const userDuplicate = await UserModel.findOne({ email: payload.email });
    if (userDuplicate !== null) {
      throw App.errorsHelper.getError('USER_ALREADY_EXISTS', {
        model: 'User',
        email: payload.email
      });
    }

    // make sure that the role actually exists
    const role: IRole | null = await RoleModel.findOne({ _id: payload.roleId });
    if (role === null) {
      throw App.errorsHelper.getError('NOT_FOUND', {
        model: 'Role',
        id: payload.roleId
      });
    }

    // encrypt password
    payload.password = await bcrypt.generateHash(payload.password);

    // create a new user
    const createdUser = await UserModel.create(payload);
    return reply.send(createdUser);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to create User');

    throw err;
  }
};

/**
 * Retrieve one user from DB
 * @param request
 * @param reply
 */
export const retrieveUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const responseData: {
      data?: IUser,
      metadata?: any
    } = {
      metadata: {}
    };

    const { userId } = request.params as { userId: string };

    const { roleId } = request.user as { roleId: string };
    const { userId: currentUserId } = request.user as { userId: string };
    const loggedInUser = {
      id: currentUserId,
      role: roleId
    };

    // retrieve the user's role
    const currentRole: IRole | null = await RoleModel.findOne(
      { _id: loggedInUser.role },
      null,
      { lean: true }
    );

    if (!currentRole?.permissions.includes('user_all') && loggedInUser.id !== userId) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    const user: IUser | null = await UserModel.findOne(
      { _id: userId },
      null,
      { lean: true }
    );

    if (user === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    responseData.data = user;

    // retrieve the user's role
    const role: IRole | null = await RoleModel.findOne(
      { _id: user.roleId },
      null,
      { lean: true }
    );

    if (role) {
      responseData.metadata.role = role;
    }

    return reply.send(responseData);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve User');

    throw err;
  }
};

/**
 * Update User instance
 * @param request
 * @param reply
 */
export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IUser;
    const { userId } = request.params as { userId: string };

    const { roleId } = request.user as { roleId: string };
    const { userId: currentUserId } = request.user as { userId: string };
    const loggedInUser = {
      id: currentUserId,
      role: roleId
    };

    // retrieve the user's role
    const currentRole: IRole | null = await RoleModel.findOne(
      { _id: loggedInUser.role },
      null,
      { lean: true }
    );

    if (!currentRole?.permissions.includes('user_all') && loggedInUser.id !== userId) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // make sure that the role actually exists
    if (payload.roleId) {
      const role: IRole | null = await RoleModel.findOne({ _id: payload.roleId });
      if (role === null) {
        throw App.errorsHelper.getError('NOT_FOUND', {
          model: 'Role',
          id: payload.roleId
        });
      }
    }

    // check if email is already used
    if (payload.email) {
      const userDuplicate = await UserModel.findOne({ email: payload.email });
      if (userDuplicate !== null && userDuplicate._id.toString() !== userId) {
        throw App.errorsHelper.getError('USER_ALREADY_EXISTS', {
          model: 'User',
          email: payload.email
        });
      }
    }

    // update the user
    const updatedUser: IUser | null = await UserModel.findOneAndUpdate(
      { _id: userId },
      payload,
      {
        new: true,
        lean: true
      }
    );

    if (updatedUser === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // return the newly updated user
    return reply.send(updatedUser);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to update User');

    throw err;
  }
};

/**
 * Delete User Instance
 * @param request
 * @param reply
 */
export const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.params as { userId: string };
    // update user.deleted flag to true
    const deletedUser: IUser | null = await UserModel.findOneAndUpdate(
      { _id: userId },
      { deactivated: true },
      {
        new: true,
        lean: true
      }
    );

    if (deletedUser === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // user deleted successfully
    reply.code(204);
    return reply.send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to delete User');

    throw err;
  }
};

/**
 * Upload Profile picture for user (1MB upload limit)
 * @param request
 * @param reply
 */
export const uploadProfilePicture = async (request: any, reply: FastifyReply) => {
  try {
    if (!request.isMultipart()) {
      return reply.code(400).send({ message: 'The request is not multipart' });
    }

    const { userId } = request.params as { userId: string };
    const oldUser: IUser | null = await UserModel.findById(userId);
    if (!oldUser) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    const picture = await request.file();
    const pump = util.promisify(pipeline);

    const dirPath = Path.join(__dirname, `./../../uploads/${userId}/profile_picture`);
    const fileName = `${uuid()}`;

    // Creates dir if it doesn't exist
    await mkdir(dirPath, { recursive: true });

    const filePath = `${dirPath}/${fileName}`;

    await pump(picture.file, fs.createWriteStream(filePath));

    if (oldUser?.settings?.profile_picture) {
      const oldFileName = oldUser.settings.profile_picture.substring(
        `public/${userId}/profile_picture/`.length,
        oldUser.settings.profile_picture.length);

      fs.unlink(`${dirPath}/${oldFileName}`, (err) => {
        console.log('Error handling file deletion', err);
      });
    }
    if (!oldUser.settings) {
      oldUser.settings = {};
    }

    oldUser.settings.profile_picture = `public/${userId}/profile_picture/${fileName}`;

    await oldUser.save();

    // return the newly updated user
    return reply.send(oldUser);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to save image and update User');

    throw err;
  }
};

/**
 * Update the user's page state.
 * @param request
 * @param reply
 */
export const updateUserPageState = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { page } = request.params as { page: string };
    const { state } = request.body as any;
    const session = await getSessionByAuthToken(request);
    await UserModel.findByIdAndUpdate(session.userId, { userPageState: { [page]: state } });

    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error while updating user state!');

    throw err;
  }
};

/**
 * Get the user's page state.
 * @param request
 * @param reply
 */
export const getUserPageState = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const session = await getSessionByAuthToken(request);
    const { page } = request.params as { page: string };
    const user = await UserModel.findById(session.userId);

    reply.code(200).send({ state: user?.userPageState?.[page] });
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error while getting user state!');

    throw err;
  }
};
/**
 * Import users from excel file.
 * @param request
 * @param reply
 */

export const importUsers = async (request: any, reply: FastifyReply) => {
  try {
    if (!request.isMultipart()) {
      return reply.code(400).send({ message: 'The request is not multipart' });
    }
    const StatusEnum = {
      SUCCESS: 'success',
      ERROR: 'error'
    };


    const excel = await request.file();

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.read(excel.file);

    const worksheet = workbook.worksheets[0];

    const rowsData: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) { // Skip the header row

        const rowData = {
          email: row.getCell(1).value?.toString(),
          password: row.getCell(2).value?.toString(),
          role: row.getCell(3).value?.toString(),
          firstName: row.getCell(4).value?.toString(),
          lastName: row.getCell(5).value?.toString(),
          location: row.getCell(6).value?.toString(),
        };

        const validation = App.validator.validatePayload(rowData, excelFileUserValidationSchema);
        const rowState = {
          status: validation ? StatusEnum.ERROR : StatusEnum.SUCCESS,
          data: validation ? validation.summary : rowData,
        };
        rowsData.push(rowState);
      }
    });
    const rolesMap: any = {};
    for (const rowData of rowsData) {
      if (rowData.status === StatusEnum.ERROR) {
        continue;
      }
      try {
        const { email, password, role, firstName, lastName, location } = rowData.data;
        let roleId: any;
        if (rolesMap[role]) {
          roleId = rolesMap[role];
        } else {
          if (!mongoose.isValidObjectId(role)) {
            roleId = await RoleModel.findOne({ name: role });
          } else {
            roleId = await RoleModel.findOne({
              $or: [{ name: role }, { _id: role }]
            });
          }
          rolesMap[role] = roleId;
        }

        if (!roleId) {
          rowData.status = StatusEnum.ERROR;
          rowData.data = `Role ${role} doesn't exist`;
          continue;
        }

        const passwordRegex = /^\$2[aby]\$10\$.{50,}$/;
        let hashedPassword = password;
        if (!passwordRegex.test(password)) {
          const bcrypt = new Bcrypt(_.get(App, 'serviceConfig.bcrypt.saltRounds')!);
          hashedPassword = await bcrypt.generateHash(password);
        }
        rowData.data = await UserModel.findOneAndUpdate(
          { email: email },
          {
            first_name: firstName,
            last_name: lastName,
            roleId: roleId._id,
            password: hashedPassword,
            location: location,
          },
          { upsert: true, new: true }
        );
      } catch (err: any) {
        rowData.status = StatusEnum.ERROR;
        rowData.data = err.toString();
      }
    }

    const response = {
      data: rowsData
    };
    return reply.send(response);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error while importing users!');

    throw err;
  }
};
/**
 * Export user list to excel file.
 * @param request
 * @param reply
 */
export const exportUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await UserModel.find({}, 'email password roleId first_name last_name location');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    const headers = ['Email', 'Password', 'Role', 'First Name', 'Last Name', 'Location'];
    worksheet.addRow(headers);

    const roles = await RoleModel.find({ _id: { $in: users.map((user) => user.roleId) } });
    const rolesMap: { [key: string]: string } = roles.reduce((acc, role) => {
      acc[String(role._id)] = role.name;
      return acc;
    }, {} as { [key: string]: string });

    users.forEach((user) => {
      const roleName = rolesMap[user.roleId]; // Get the role name from the rolesMap using roleId
      const userData = [user.email, user.password, roleName, user.first_name, user.last_name, user.location]; // Use roleName instead of roleId
      worksheet.addRow(userData);
    });
    // Create a new writable stream
    const outputStream = new stream.PassThrough();

    await workbook.xlsx.write(outputStream);

    return reply.send(outputStream);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error while exporting users!');

    throw err;
  }
};

/**
 * Export user template file.
 * @param request
 * @param reply
 */
export const exportTemplateForUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    const headers = ['Email', 'Password', 'Role', 'First Name', 'Last Name', 'Location'];
    worksheet.addRow(headers);

    const outputStream = new stream.PassThrough();

    await workbook.xlsx.write(outputStream);

    return reply.send(outputStream);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error while exporting users!');

    throw err;
  }
};

/**
 * Change user's password
 * @param request
 * @param reply
 */
export const changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const bcrypt = new Bcrypt(_.get(App, 'serviceConfig.bcrypt.saltRounds')!);
    const { id } = request.params as { id: string };
    const { current_password, new_password } = request.body as { current_password?: string, new_password: string };

    const currentUser = await UserModel.findById(id, '+password');
    if (!currentUser) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }
    const isCurrentUser = id === request.user!.userId;
    const isAdmin = request.user!.permissions.includes('user_all');

    if(isCurrentUser && !isAdmin && !current_password){
      throw App.errorsHelper.getError('VALIDATION_ERROR');
    }

    if (isCurrentUser && current_password) {
      const passwordsMatch: boolean = await bcrypt.compareHash(current_password, currentUser.password);
      if (!passwordsMatch) {
        throw App.errorsHelper.getError('INVALID_PASSWORD');
      }
      currentUser.password = await bcrypt.generateHash(new_password);
      await currentUser.save();
    } else if (isAdmin) {
      currentUser.password = await bcrypt.generateHash(new_password);
      await currentUser.save();
    } else{
      throw App.errorsHelper.getError('INVALID_PERMISSIONS_ERROR');
    }

    return reply.code(200).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error while changing user\'s password!');

    throw err;
  }
};