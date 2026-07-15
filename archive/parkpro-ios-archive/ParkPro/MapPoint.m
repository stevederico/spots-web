//
//  MapPoint.m
//  ParkPro
//
//  Created by Steve Derico on 12/11/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//

#import "MapPoint.h"

@implementation MapPoint

@synthesize title = _title;
@synthesize coordinate = _coordinate;
@synthesize spot = _spot;
- (id)initWithTitle:(NSString *)ttl andCoordinate:(CLLocationCoordinate2D)c2d{
    self = [super init];
    
    self.title = ttl;
    _coordinate = c2d;
    
    return self;
    
}

- (NSString *)subtitle{

    return self.spot.style.description;
}


@end

