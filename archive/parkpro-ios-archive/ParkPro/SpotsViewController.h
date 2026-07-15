//
//  SpotsViewController.h
//  ParkPro
//
//  Created by Steve Derico on 12/11/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//

#import "AccountViewController.h"
#import "ListingViewController.h"
#import <UIKit/UIKit.h>

@interface SpotsViewController : UITableViewController
@property (nonatomic,strong) NSManagedObjectContext *managedObjectContext;
@end
