import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Audio, Image, Word, WordDifficulty } from "entities/word.entities";
import { S3Service } from "resources/media/s3.service";
import { Repository } from "typeorm";

@Injectable()
export class WordsService {
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,

    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,

    @InjectRepository(Audio)
    private readonly audioRepository: Repository<Audio>,
  ) {}

  // TODO include creator ID
  async create(
    word: string,
    definition: string,
    sentence: string,
    image: Express.Multer.File,
    audio: Express.Multer.File,
    comment: string | null = null,
    difficulty: WordDifficulty = "Basic",
  ): Promise<Word> {
    const existing = await this.wordRepository.findOne({
      where: { word: word, sentence: sentence },
      withDeleted: true,
    });

    if (existing && !existing.deletedAt) {
      throw new BadRequestException(
        `${word} with "${sentence}" already exists.`,
      );
    }

    const imageLink = await this.s3Service.uploadFile(image);
    if (!imageLink)
      throw new BadRequestException("Invalid/Missing image given");
    const audioLink = await this.s3Service.uploadFile(audio);
    if (!audioLink)
      throw new BadRequestException("Invalid/Missing audio given");

    if (existing?.deletedAt) {
      await this.wordRepository.restore(existing.id);

      return await this.wordRepository.save({
        ...existing,
        definition,
        difficulty,
        comment,
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

    return await this.wordRepository.save({
      word: word,
      definition: definition,
      sentence: sentence,
      difficulty: difficulty,
      comment: comment,
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

  findAll() {
    return this.wordRepository.find({
      withDeleted: false,
      relations: {
        audios: true,
        images: true,
      },
    });
  }

  findOneById(id: string) {
    return this.wordRepository.findOne({
      withDeleted: false,
      relations: {
        audios: true,
        images: true,
      },
      where: {
        id: id,
      },
    });
  }

  async update(
    id: string,
    sentence: string,
    comment: string | null,
    difficulty: WordDifficulty,
    image: Express.Multer.File | null,
    audio: Express.Multer.File | null,
  ) {
    const word = await this.findOneById(id);
    if (!word) throw new NotFoundException("Word not found");

    const hasHomonym = await this.wordRepository.findOneBy({
      word: word.word,
      sentence: sentence,
    });
    if (!!hasHomonym && hasHomonym.id !== word.id)
      throw new BadRequestException(
        `${word.word} with"${sentence}" already exists.`,
      );

    word.sentence = sentence;
    word.comment = comment;
    word.difficulty = difficulty;
    if (!word.images || !word.audios) throw new InternalServerErrorException();

    if (image !== null) {
      const imageLink = await this.s3Service.uploadFile(image);
      if (!imageLink)
        throw new BadRequestException("Invalid/Missing image given");

      await this.imageRepository.update(word.images[0].id, { link: imageLink });
      word.images[0].link = imageLink;
    }
    if (audio !== null) {
      const audioLink = await this.s3Service.uploadFile(audio);
      if (!audioLink)
        throw new BadRequestException("Invalid/Missing audio given");

      await this.audioRepository.update(word.audios[0].id, { link: audioLink });
      word.audios[0].link = audioLink;
    }

    await this.wordRepository.update(id, {
      sentence: sentence,
      comment: comment,
      difficulty: difficulty,
    });

    return word;
  }

  deleteById(id: string) {
    return this.wordRepository.softDelete({
      id: id,
    });
  }
}
