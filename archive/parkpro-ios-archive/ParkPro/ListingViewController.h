//
//  ListingViewController.h
//  ParkPro
//
//  Created by Steve Derico on 12/11/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//
#import "MapPoint.h"
#import "Spot.h"
#import <UIKit/UIKit.h>

@interface ListingViewController : UIViewController <UITableViewDataSource, UITableViewDelegate>
@property (strong, nonatomic) IBOutlet MKMapView *mapView;
@property (strong, nonatomic) IBOutlet UITableView *tableView;
@property (strong, nonatomic) Spot *spot;
- (IBAction)parkHereTapped:(id)sender;
- (id)initWithSpot:(Spot *)s;
@end
