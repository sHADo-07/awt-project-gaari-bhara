import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRentDto, UpdateRentDto } from "@/modules/rent/dto/rent.dto";
import { Rent } from "@/modules/rent/entities/rent.entity";

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(Rent)
    private readonly rentRepository: Repository<Rent>,
  ) {}

  async getRents() {
    return this.rentRepository.find();
  }

  async getRentById(id: string) {
    const rent = await this.rentRepository.findOne({ where: { id } });
    if (!rent) {
      throw new NotFoundException("Rent with ID not found");
    }
    return rent;
  }

  async createRent(dto: CreateRentDto) {
    const rent = this.rentRepository.create(dto);
    return this.rentRepository.save(rent);
  }

  async updateRent(id: string, dto: UpdateRentDto) {
    const rent = await this.getRentById(id);
    Object.assign(rent, dto);
    return this.rentRepository.save(rent);
  }

  async deleteRent(id: string) {
    await this.getRentById(id);
    return this.rentRepository.delete({ id });
  }
}
