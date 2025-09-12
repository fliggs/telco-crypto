import { Module } from '@nestjs/common';

import { VolumeService } from './volume.service';
import { VolumeLoader } from './volume.loader';

@Module({
	providers: [VolumeLoader, VolumeService],
	exports: [VolumeLoader, VolumeService],
})
export class VolumeModule {}
