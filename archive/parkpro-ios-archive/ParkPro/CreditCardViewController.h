//
//  CreditCardViewController.h
//  ParkPro
//
//  Created by Steve Derico on 12/18/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//
#import "AddCreditCardViewController.h"
#import "ViewCardViewController.h"
#import <UIKit/UIKit.h>

@interface CreditCardViewController : UIViewController <UITableViewDataSource, UITableViewDelegate>
@property (strong, nonatomic) IBOutlet UITableView *tableView;

@end
