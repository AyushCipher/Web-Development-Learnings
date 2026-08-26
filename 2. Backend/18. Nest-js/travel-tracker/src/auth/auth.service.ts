import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //handle the new user registration
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    //check if the user is exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'User already exists! Please try with a different email',
      );
    }
    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //create new user
    const newlyCreatedUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    //remove password from the return object
    const { password: _, ...result } = newlyCreatedUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    //find the current user by email as email is an unique property
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials! Please try again');
    }

    //verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials! Please try again');
    }

    const token = this.jwtService.sign({ userId: user.id });

    const { password: _, ...result } = user;

    return { ...result, token };
  }
}
