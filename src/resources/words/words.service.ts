import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Audio, Image, Word, WordDifficulty } from "entities/word.entities";
import { Repository } from "typeorm";
import { S3Service } from "resources/media/s3.service";

@Injectable()
export class WordsService {
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(Audio)
    private readonly audioRepository: Repository<Audio>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  // TODO include creator ID
  async createWord(
    word: string,
    definition: string,
    sentence: string,
    image: Express.Multer.File,
    audio: Express.Multer.File,
    comment: string | null = null,
    difficulty: WordDifficulty = "Basic",
  ): Promise<Word> {
    const hasHomonym = await this.wordRepository.findOneBy({
      word: word,
      definition: definition,
    });
    if (!!hasHomonym)
      throw new BadRequestException(
        `${word} defined as ${definition} already exists.`,
      );

    const imageLink = await this.s3Service.uploadFile(image);
    if (!imageLink)
      throw new BadRequestException("Invalid/Missing image given");
    const audioLink = await this.s3Service.uploadFile(audio);
    if (!audioLink)
      throw new BadRequestException("Invalid/Missing audio given");

    return await this.wordRepository.save({
      word: word,
      definition: definition,
      sentence: sentence,
      difficulty: difficulty,
      images: [
        {
          link: imageLink,
        },
      ],
      audios: [
        {
          link: audioLink,
        },
      ],
    });
  }

  async getWordBank() {
    return this.wordRepository.find({
      withDeleted: false,
      relations: {
        audios: true,
        images: true,
      },
    });
  }
}
