//
//  TransactionViewController.h
//  ParkPro
//
//  Created by Steve Derico on 12/18/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//
#import "SDTextFieldCell.h"
#import "Spot.h"
#import <UIKit/UIKit.h>

@interface TransactionViewController : UIViewController <UITableViewDataSource,UITableViewDelegate>
@property (strong, nonatomic) IBOutlet UITableView *tableView;
@property (nonatomic,strong) Spot *spot;
- (id)initWithSpot:(Spot *)s;
- (IBAction)buyTapped;
@end
