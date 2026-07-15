//
//  ListingViewController.m
//  ParkPro
//
//  Created by Steve Derico on 12/11/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//
#import "TransactionViewController.h"
#import "ListingViewController.h"

@interface ListingViewController ()

@end

@implementation ListingViewController
@synthesize spot;


- (id)initWithSpot:(Spot *)s{
    
    self = [super initWithNibName:@"ListingViewController" bundle:nil];
    if (self) {
        // Custom initialization
        [self.mapView setZoomEnabled:YES];
        [self.mapView setScrollEnabled:YES];
        [self.mapView setShowsUserLocation:YES];
         [self.mapView setUserTrackingMode:MKUserTrackingModeFollowWithHeading animated:YES];
       
        self.spot = s;

        self.title = self.spot.title;
        
    }
    return self;
}

- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    
    
    CLLocationCoordinate2D location;
	location.latitude = self.spot.latitude.doubleValue;
	location.longitude = self.spot.longitude.doubleValue;
    
    MKCoordinateRegion region =
    MKCoordinateRegionMakeWithDistance (
                                        location, 150, 150);
    
    [self.mapView setRegion:region animated:NO];
    
    self.mapView.centerCoordinate = location;


}


- (void)viewDidLoad {
    [super viewDidLoad];
//  self.mapView.centerCoordinate = self.mapView.userLocation.location.coordinate;
    
    
    [self.mapView setShowsUserLocation:YES];
    [self.mapView setZoomEnabled:YES];
    [self.mapView setScrollEnabled:YES];
    [self.mapView setUserTrackingMode:MKUserTrackingModeFollow animated:YES];
  
    NSLog(@"SPOT %@",spot);
    
    CLLocationCoordinate2D location;
	location.latitude = self.spot.latitude.doubleValue;
	location.longitude = self.spot.longitude.doubleValue;
    
    MapPoint *destination = [[MapPoint alloc] initWithTitle:self.spot.title andCoordinate:location];
	[self.mapView addAnnotation:destination];
    
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - UITableViewDataSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    
    return 1;
    
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    
    return 5;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:CellIdentifier];
    }
    
    if (indexPath.section == 0) {
        if (indexPath.row == 0) {
            cell.textLabel.text = @"Type";
             cell.detailTextLabel.text = self.spot.style.description;
        }else if (indexPath.row == 1) {
            cell.textLabel.text = @"Price/hr";
            cell.detailTextLabel.text = [NSString stringWithFormat:@"$%.2f",self.spot.price.floatValue];
        }else if (indexPath.row == 2) {
            cell.textLabel.text = @"Overnight";
            cell.detailTextLabel.text = [NSString stringWithFormat:@"$%.2f",self.spot.overnight.floatValue];
        } else if (indexPath.row == 3) {
            cell.textLabel.text = @"Address";
            cell.detailTextLabel.text = self.spot.streetAddress.description;
        }else if (indexPath.row == 4) {
            cell.textLabel.text = @"More Info";
            cell.detailTextLabel.text = self.spot.summary.description;
            cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
        }
    }
  
    
    
    return cell;
}

- (IBAction)parkHereTapped:(id)sender {

    TransactionViewController *tvc = [[TransactionViewController alloc] initWithSpot:self.spot];
    UINavigationController *navController = [[UINavigationController alloc] initWithRootViewController:tvc];
    
    [self presentViewController:navController animated:YES completion:nil];

}


@end
