import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class UserType {
  @Field(() => Int)
  id!: number;

  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field(() => UserRole)
  role!: UserRole;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field()
  createdAt!: Date;
}

