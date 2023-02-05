import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { WordDatumDto, WordEntityDto } from "./dto/words.dto";

@Controller("words")
export class WordsController {
  @Get()
  async get(): Promise<WordEntityDto[]> {
    await Promise.resolve();
    return [];
  }

  @Post()
  async create(@Body() data: WordDatumDto): Promise<WordEntityDto> {
    await Promise.resolve();
    return new WordEntityDto();
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() data: WordDatumDto,
  ): Promise<WordEntityDto> {
    await Promise.resolve();
    return new WordEntityDto();
  }
}
