import { Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
export interface VideoData {
  id: number;
  name: string;
  duration: string;
  title: string;
  url?: string; // Make URL optional for the video
}

const allVideos: VideoData[] = [
  {
    id: 1,
    name: 'tom-and-jerry',
    duration: '3 mins',
    title: 'Tom & Jerry',
  },
  {
    id: 2,
    name: 'soul',
    duration: '4 mins',
    title: 'Soul',
    url: 'https://f004.backblazeb2.com/file/ok767777/whole+lotta+final.mp4', // Example URL
  },
  {
    id: 3,
    name: 'outside-the-wire',
    duration: '2 mins',
    title: 'Outside the wire',
  },
];
@Injectable()
export class VideoService {
  create(createVideoDto: CreateVideoDto) {
    return 'This action adds a new video';
  }

  findAll(): VideoData[] {
    return allVideos;
  }

  findOne(id: number): VideoData | string {
    const video = allVideos.find((video) => video.id === id);
    if (!video) {
      return `There is no video with id ${id}`;
    }
    if (!video.url) {
      return `There is no URL for video with id ${id}`;
    }
    return video;
  }

  update(id: number, updateVideoDto: UpdateVideoDto) {
    return `This action updates a video with id ${id}`;
  }

  remove(id: number) {
    return `This action removes a video with id ${id}`;
  }
}
