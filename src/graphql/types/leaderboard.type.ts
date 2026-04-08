import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LeaderboardEntryType {
  @Field(() => Int)
  rank!: number;

  @Field(() => Int)
  userId!: number;

  @Field()
  username!: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => Int)
  totalScore!: number;

  @Field(() => Int)
  totalQuizzes!: number;

  @Field()
  averageScore!: number;
}

