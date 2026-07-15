//
//  AppDelegate.h
//  ParkPro
//
//  Created by Steve Derico on 12/10/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//
#import "SDLoginKit.h"
#import "SSKeychain.h"  
#import <UIKit/UIKit.h>

#import "ParkProIncrementalStore.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate, SDLoginViewControllerDelelgate, SDSignUpViewControllerDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (readonly, strong, nonatomic) NSManagedObjectContext *managedObjectContext;
@property (readonly, strong, nonatomic) NSManagedObjectModel *managedObjectModel;
@property (readonly, strong, nonatomic) NSPersistentStoreCoordinator *persistentStoreCoordinator;
@property (nonatomic, strong) SDLoginViewController *loginViewController;

- (void)saveContext;
- (void)setupLoggedInUser;
@property (strong, nonatomic) UINavigationController *navigationController;

@end
