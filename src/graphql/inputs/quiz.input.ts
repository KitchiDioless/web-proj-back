import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class QuizQuestionInput {
  @Field()
  text!: string;

  @Field(() => String, { nullable: true })
  image?: string | null;

  @Field(() => [String])
  options!: string[];

  @Field(() => Int)
  correctAnswer!: number;
}

@InputType()
export class CreateQuizInput {
  @Field(() => Int)
  gameId!: number;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true })
  coverImage?: string | null;

  @Field(() => [QuizQuestionInput])
  questions!: QuizQuestionInput[];
}

@InputType()
export class UpdateQuizInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class VoteQuizInput {
  @Field(() => Int)
  quizId!: number;

  @Field(() => String, { nullable: true })
  vote?: string | null;
}

