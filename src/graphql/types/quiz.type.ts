import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { QuizDifficulty } from '@prisma/client';
import { GameType } from './game.type';
import { UserType } from './user.type';

registerEnumType(QuizDifficulty, { name: 'QuizDifficulty' });

@ObjectType()
export class QuizQuestionType {
  @Field(() => Int)
  id!: number;

  @Field()
  text!: string;

  @Field(() => String, { nullable: true })
  image?: string | null;

  @Field(() => [String])
  options!: string[];

  @Field(() => Int)
  correctAnswer!: number;

  @Field(() => Int)
  order!: number;
}

@ObjectType()
export class QuizType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  gameId!: number;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true })
  coverImage?: string | null;

  @Field(() => Int)
  createdByUserId!: number;

  @Field(() => QuizDifficulty)
  difficulty!: QuizDifficulty;

  @Field(() => Int)
  upvotes!: number;

  @Field(() => Int)
  downvotes!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => [QuizQuestionType])
  questions!: QuizQuestionType[];

  @Field(() => GameType, { nullable: true })
  game?: GameType | null;

  @Field(() => UserType, { nullable: true })
  createdBy?: UserType | null;
}

