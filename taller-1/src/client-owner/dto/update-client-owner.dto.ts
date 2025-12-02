import { PartialType } from '@nestjs/mapped-types';
import { CreateClientOwnerDto } from './create-client-owner.dto';

export class UpdateClientOwnerDto extends PartialType(CreateClientOwnerDto) {}
