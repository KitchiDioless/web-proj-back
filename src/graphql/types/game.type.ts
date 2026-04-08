import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GameType {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  coverImageUrl?: string | null;

  @Field(() => Date, { nullable: true })
  releasedAt?: Date | null;

  @Field()
  createdAt!: Date;
}

