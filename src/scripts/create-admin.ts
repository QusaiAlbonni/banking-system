import { AppModule } from '@/app.module';
import { UserService } from '@/user/application/services/user.service';
import { Role } from '@/user/domain/role';
import { NestFactory } from '@nestjs/core';
import { createInterface } from 'readline';

// Function to prompt for input
async function getUserInput() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = (str: string) =>
    new Promise<string>((resolve) => rl.question(str, resolve));

  const firstName = await question('Enter first name: ');
  const lastName = await question('Enter last name: ');
  const email = await question('Enter email: ');
  const phone = await question('Enter Your Phone Number: ');
  const password = await question('Enter password: ');

  rl.close();
  return { firstName, lastName, email, phone, password, role: Role.ADMIN };
}

async function createAdmin() {
  // Get user input from the console
  const adminDto = await getUserInput();

  // Create a NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UserService);

  try {
    // Check if admin already exists
    const existingAdmin = await usersService.findByEmail(adminDto.email);
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      await app.close();
      return;
    }

    // Create admin with isActive=true and mustChangePassword=false
    const adminUser = await usersService.createAdmin(adminDto);
    console.log('Admin user created successfully:', adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }

  // Close the app context
  await app.close();
}

createAdmin();
