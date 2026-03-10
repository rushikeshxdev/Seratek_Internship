import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreatePropertyDto } from './dto/createProperty.dto';

@Controller('property')
export class PropertyController {
    @Get()
    findAll(){
        return "All properties";
    }

    @Get(':id/:slug')
    findOne(@Param('id') id, @Param('slug') slug){
        return `id = ${id}, slug = ${slug}`;
    }

    @Get(':id')
    findOne2(@Param('id', ParseIntPipe) id, @Query('sort', ParseBoolPipe) sort) {
        console.log(typeof id);
        console.log(typeof sort);
        return id;
    }

    @Post()
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}))
    create(@Body() body: CreatePropertyDto){
        return body;
    }
}
