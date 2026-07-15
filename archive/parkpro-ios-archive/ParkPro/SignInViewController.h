//
//  SignInViewController.h
//  ParkPro
//
//  Created by Steve Derico on 12/16/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//
#import "AppDelegate.h"
#import "SSKeychain.h"
#import "ParkProAPIClient.h"
#import <UIKit/UIKit.h>

@interface SignInViewController : UIViewController
- (IBAction)loginTapped:(id)sender;
@property (strong, nonatomic) IBOutlet UITextField *passwordField;
@property (strong, nonatomic) IBOutlet UITextField *emailField;

@end
