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
import { readJSONSync } from 'fs-extra';
import { getConnection } from '../server/core/database/mongodbConnection';
import { Bcrypt } from '../server/helpers/bcrypt';
import * as Path from 'path';
import { RoleModel } from '../models/role';
import { UserModel } from '../models/user';
import { Command } from 'commander';
import inquirer, { Answers } from 'inquirer';

const program = new Command();

const permissions = readJSONSync(
  Path.resolve(__dirname, './../config/permissions.json')
);
const config = readJSONSync(Path.resolve(__dirname, './../config/config.json'));
const userRoles = ['admin', 'manager', 'statistician', 'reporter'];
// cache mongodb connection
let connection: any;
interface RolePermissions {
  manager: string[];
  statistician: string[];
  reporter: string[];
}
interface UserCredentials {
  email: string;
  password: string;
}
/**
 * Creates/Updates the default roles
 */
const initDefaultRoles = async () => {
  try {
    const rolePermissions = {
      manager: permissions.filter((permission: string) =>
        [
          'user_my',
          'case_all',
          'contact_all',
          'patient_all',
          'bed_all',
          'death_all',
          'vaccine_all',
          'test_all',
          'variant_all',
          'strain_all',
          'human_resources_all',
          'survey_all',
          'participatory_surveillance_all',
          'modelling_all',
          'social_media_analysis_all',
          'report_all',
          'primary_care_all',
          'intervention_all',
          'population_all',
          'flights_all',
        ].includes(permission)
      ),
      statistician: permissions.filter((permission: string) =>
        [
          'user_my',
          'case_all',
          'contact_all',
          'patient_all',
          'bed_all',
          'death_all',
          'vaccine_all',
          'test_all',
          'variant_all',
          'strain_all',
          'human_resources_all',
          'participatory_surveillance_all',
          'modelling_all',
          'social_media_analysis_all',
          'report_all',
          'primary_care_all',
          'population_all',
        ].includes(permission)
      ),
      reporter: permissions.filter((permission: string) =>
        [
          'user_my',
          'case_all',
          'contact_all',
          'patient_all',
          'bed_all',
          'death_all',
          'vaccine_all',
          'test_all',
          'variant_all',
          'strain_all',
          'human_resources_all',
          'survey_all',
          'participatory_surveillance_all',
          'report_all',
          'primary_care_all',
          'intervention_all',
          'population_all',
          'flights_all',
        ].includes(permission)
      ),
      admin: permissions.filter(
        (permission: string) => !['user_my'].includes(permission)
      ),
    };

    const roleIdsMap: Record<string, string> = {};
    for (const role of userRoles) {
      const rolePermissionsArray =
        rolePermissions[role as keyof RolePermissions] || [];

      const currentRole = await RoleModel.findOneAndUpdate(
        { name: role },
        { permissions: rolePermissionsArray },
        { upsert: true, new: true }
      );

      roleIdsMap[role] = currentRole._id.toString();
    }

    return roleIdsMap;
  } catch (err) {
    console.error('Error creating manager role: ' + err);
  }
};

/**
 * Init the default users
 * @returns all default users
 */
const initDefaultUsers = async (
  roles: any,
  users: any
) => {
  try {
    const admin = await createUser(
      'admin',
      'admin',
      roles.admin,
      users.admin.email,
      users.admin.password
    );

    const manager = await createUser(
      'manager',
      'manager',
      roles.manager,
      users.manager.email,
      users.manager.password
    );

    const statistician = await createUser(
      'statistician',
      'statistician',
      roles.statistician,
      users.statistician.email,
      users.statistician.password
    );

    const reporter = await createUser(
      'reporter',
      'reporter',
      roles.reporter,
      users.reporter.email,
      users.reporter.password
    );

    return { admin, manager, reporter, statistician };
  } catch (err) {
    console.error('Error creating default users: ' + err);
  }
};

/**
 * Create a user
 * @returns the created user
 */
const createUser = async (
  firstName: string,
  lastName: string,
  roleId: string,
  email: string,
  password: string
) => {
  const bcrypt = new Bcrypt(config.bcrypt.saltRounds!);
  const hashedPassword = await bcrypt.generateHash(password);

  return UserModel.findOneAndUpdate(
    { email: email },
    {
      first_name: firstName,
      last_name: lastName,
      roleId: roleId,
      password: hashedPassword,
    },
    { upsert: true, new: true }
  );
};

/**
 * Execute script functionality
 * @returns {Promise<any | void>}
 */
const run = async () => {
  if(!connection)
    connection = await getConnection(config.mongodb);

  const saltRounds = config.bcrypt?.saltRounds;
  if (!saltRounds) {
    console.error('Config validation error. bcrypt.saltRounds is required');
    process.exit(1);
  }
  // describe script
  program
    .version('1.0.0')
    .description('Module used for initialization of users!');

  // add script options
  program
    .command('create-users')
    .description('Create default users')
    .action(async () => {
      const users: Record<string, UserCredentials> = {};
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      for (const role of userRoles) {
        const answers: Answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: `Enter the email for ${role}:`,
            validate: (input) => {
              if (!input) {
                return 'Email cannot be empty';
              }
              if (!emailRegex.test(input)) {
                return 'Invalid email format';
              }
              return true;
            },
          },
          {
            type: 'password',
            name: 'password',
            message: `Enter the password for ${role}:`,
            validate: (input) => (input ? true : 'Password cannot be empty'),
          },
        ]);

        const { email, password } = answers;

        users[role] = {
          email,
          password,
        };
      }

      try {
        const roles = await initDefaultRoles();
        const defaultUsers = await initDefaultUsers(roles, users);
        if (defaultUsers) {
          console.log('Default users were created / updated successfully');
          process.exit();
        }
      } catch (err) {
        console.error('Error creating / updating default users');
        console.error(err);
        process.exit(1);
      }
    });

  program.parse(process.argv);
};

run().catch(() => {
  // error already handled
});
