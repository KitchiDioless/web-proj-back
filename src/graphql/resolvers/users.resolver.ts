import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from '../../users/users.service';
import { UserType } from '../types/user.type';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly users: UsersService) {}

  @Query(() => [UserType])
  usersList() {
    return this.users.list();
  }

  @Query(() => UserType)
  user(@Args('id', { type: () => Int }) id: number) {
    return this.users.getById(id);
  }
}

