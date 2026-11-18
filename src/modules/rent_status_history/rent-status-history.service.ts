import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreateRentStatusHistoryDto,
  UpdateRentStatusHistoryDto,
} from "@/modules/rent_status_history/dto/rent-status-history.dto";
import { RentStatusHistory } from "@/modules/rent_status_history/entities/rent-status-history.entity";

@Injectable()
export class RentStatusHistoryService {
  constructor(
    @InjectRepository(RentStatusHistory)
    private readonly rentStatusHistoryRepository: Repository<RentStatusHistory>,
  ) {}

  async getRentStatusHistories() {
    return this.rentStatusHistoryRepository.find({
      order: { id: "ASC" },
    });
  }

  async getRentStatusHistoryById(id: string) {
    const history = await this.rentStatusHistoryRepository.findOne({
      where: { id },
    });
    if (!history) {
      throw new NotFoundException("Rent status history with ID not found");
    }
    return history;
  }

  async getRentStatusHistoryByRentId(rentId: string) {
    return this.rentStatusHistoryRepository.find({
      where: { rent_id: rentId },
      order: { id: "ASC" },
    });
  }

  async createRentStatusHistory(dto: CreateRentStatusHistoryDto) {
    const history = this.rentStatusHistoryRepository.create(dto);
    return this.rentStatusHistoryRepository.save(history);
  }

  async updateRentStatusHistory(id: string, dto: UpdateRentStatusHistoryDto) {
    const history = await this.getRentStatusHistoryById(id);
    Object.assign(history, dto);
    return this.rentStatusHistoryRepository.save(history);
  }

  async deleteRentStatusHistory(id: string) {
    await this.getRentStatusHistoryById(id);
    return this.rentStatusHistoryRepository.delete({ id });
  }
}
