//
//  MapPoint.h
//  ParkPro
//
//  Created by Steve Derico on 12/11/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//
#import "Spot.h"
#import <MapKit/MapKit.h>
#import <CoreLocation/CoreLocation.h>
#import <Foundation/Foundation.h>

@interface MapPoint : NSObject <MKAnnotation>

@property (nonatomic,strong) NSString *title;
@property (nonatomic, readonly) CLLocationCoordinate2D coordinate;
@property (nonatomic,strong) Spot *spot;
- (id)initWithTitle:(NSString*)ttl andCoordinate:(CLLocationCoordinate2D)c2d;


@end