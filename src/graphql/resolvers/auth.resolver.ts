import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../../auth/auth.service';
import { LoginInput, RefreshInput, RegisterInput } from '../inputs/auth.input';
import { AuthPayloadType } from '../types/auth.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayloadType)
  register(@Args('input') input: RegisterInput) {
    return this.auth.register(input.username, input.email, input.password);
  }

  @Mutation(() => AuthPayloadType)
  login(@Args('input') input: LoginInput) {
    return this.auth.login(input.email, input.password);
  }

  @Mutation(() => AuthPayloadType)
  refresh(@Args('input') input: RefreshInput) {
    return this.auth.refresh(input.refreshToken);
  }
}

