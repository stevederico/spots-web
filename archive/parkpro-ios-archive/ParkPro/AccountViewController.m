//
//  AccountViewController.m
//  ParkPro
//
//  Created by Steve Derico on 12/11/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//

#import "AccountViewController.h"

@interface AccountViewController ()

@end

@implementation AccountViewController

- (id)initWithStyle:(UITableViewStyle)style
{
    self = [super initWithStyle:style];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];

    UIBarButtonItem *cancelButton = [[UIBarButtonItem alloc] initWithTitle:@"Cancel" style:UIBarButtonItemStyleBordered target:self action:@selector(cancel)];
    self.navigationItem.leftBarButtonItem = cancelButton;
    
    self.title = @"Account";
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{

    // Return the number of sections.
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{

    // Return the number of rows in the section.
    return 4;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
        cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    }
    
    if (indexPath.row == 0) {
        cell.textLabel.text = @"Profile";

    }else if (indexPath.row == 1) {
        cell.textLabel.text = @"Billing";
        
    }else if (indexPath.row == 2) {
        cell.textLabel.text = @"Cars";
        
    }else{
        cell.textLabel.text = @"History";

    }
    
    return cell;
}


#pragma mark - Table view delegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.row == 0) {
        ProfileViewController *detailViewController = [[ProfileViewController alloc] initWithNibName:@"ProfileViewController" bundle:nil];
        
        [self.navigationController pushViewController:detailViewController animated:YES];
    }else if (indexPath.row == 1) {
        CreditCardViewController *detailViewController = [[CreditCardViewController alloc] init];
        
        [self.navigationController pushViewController:detailViewController animated:YES];
    
    }else{
        
        AppDelegate *appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
        
        SDScaffoldIndexViewController  *sfc = [[SDScaffoldIndexViewController alloc] initWithEntityName:@"Spot" sortBy:@"price" context:appDelegate.managedObjectContext];
        sfc.isCreatable = YES;
        sfc.isViewable = YES;
        sfc.isEditable = YES;
        sfc.isDeletable = YES;
        [self.navigationController pushViewController:sfc animated:YES];
    
    }

    

}

- (void)cancel{

    [self dismissViewControllerAnimated:YES completion:nil];

}

@end
