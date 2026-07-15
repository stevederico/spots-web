//
//  SignInViewController.m
//  ParkPro
//
//  Created by Steve Derico on 12/16/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//

#import "SignInViewController.h"

@interface SignInViewController ()

@end

@implementation SignInViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    [self.emailField becomeFirstResponder];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)loginTapped:(id)sender {
    
    NSDictionary *params = [NSDictionary dictionaryWithObjectsAndKeys:self.emailField.text,@"email",self.passwordField.text,@"password", nil];
    
        //Send Request
        [[ParkProAPIClient sharedClient] postPath:@"/tokens" parameters:params success:^(AFHTTPRequestOperation *operation, id responseObject) {
            
            NSString *token = [responseObject objectForKey:@"token"];
            
            NSLog(@"TOKEN %@",token);
            
            [SSKeychain setPassword:token forService:@"Spots" account:@"currentuser"];


//            [[ParkProAPIClient sharedClient] setAuthorizationHeaderWithToken: token];
             [[ParkProAPIClient sharedClient] setDefaultHeader:@"auth_token" value:token];

            
            AppDelegate *appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
            [appDelegate.navigationController dismissViewControllerAnimated:YES completion:nil];
            
            [appDelegate setupLoggedInUser];
            
            
        } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
            NSLog(@"FAILED %@",[error description]);
        }];
    
    
        //Save Token
    
}
@end
