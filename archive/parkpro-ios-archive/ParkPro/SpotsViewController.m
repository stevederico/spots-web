//
//  SpotsViewController.m
//  ParkPro
//
//  Created by Steve Derico on 12/11/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//

#import "SpotsViewController.h"

@interface SpotsViewController () <NSFetchedResultsControllerDelegate,SSPullToRefreshViewDelegate>{

    
}
@property SSPullToRefreshView *pullToRefreshView;
@property NSFetchedResultsController *fetchedResultsController;
@end

@implementation SpotsViewController

- (void)viewDidLoad{

    [super viewDidLoad];
    
    self.title = NSLocalizedString(@"Spots", nil);
    
    [self refreshData];
    
    self.pullToRefreshView = [[SSPullToRefreshView alloc] initWithScrollView:self.tableView delegate:self];
    
    UIBarButtonItem *accountButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemBookmarks target:self action:@selector(showAccount)];
    self.navigationItem.leftBarButtonItem = accountButton;
    
    UIBarButtonItem *mapButton = [[UIBarButtonItem alloc] initWithTitle:@"MAP" style:UIBarButtonItemStyleBordered target:self action:@selector(showMapView)];
    self.navigationItem.rightBarButtonItem = mapButton;
    
    UIBarButtonItem *backButton = [[UIBarButtonItem alloc] initWithTitle:@"Back" style:UIBarButtonItemStyleBordered target:nil action:nil];
    self.navigationItem.backBarButtonItem = backButton;
    

}

- (void)refreshData{
    
     [self.pullToRefreshView startLoading];

    NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] initWithEntityName:@"Spot"];
    fetchRequest.sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"price" ascending:YES]];
    
    self.fetchedResultsController = [[NSFetchedResultsController alloc] initWithFetchRequest:fetchRequest managedObjectContext:self.managedObjectContext sectionNameKeyPath:nil cacheName:nil];
    
    self.fetchedResultsController.delegate = self;
    [self.fetchedResultsController performFetch:nil];
    
    [self.pullToRefreshView finishLoading];

}



#pragma mark - UITableViewDataSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    
    return [[self.fetchedResultsController sections] count];

}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{

    return [[[self.fetchedResultsController sections] objectAtIndex:section] numberOfObjects];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{

    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:CellIdentifier];
    }
    
    
    [self configureCell:cell forRowAtIndexPath:indexPath];

    return cell;
}

- (void)configureCell:(UITableViewCell*)cell forRowAtIndexPath:(NSIndexPath*)indexPath{


    
    NSManagedObject *managedObject = [self.fetchedResultsController objectAtIndexPath:indexPath];
    
    cell.textLabel.text = [[managedObject valueForKey:@"title"] description];
    cell.detailTextLabel.text = [NSString stringWithFormat:@"$%.2f/hour",[[managedObject valueForKey:@"price"] floatValue]];
    cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;

}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
        // Return YES if you want the specified item to be editable.
    return YES;
}

    // Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (editingStyle == UITableViewCellEditingStyleDelete) {
            //add code here for when you hit delete
         
        
        [self.managedObjectContext performBlock:^{
            NSManagedObject *managedObject = [self.fetchedResultsController objectAtIndexPath:indexPath];
            [self.managedObjectContext deleteObject:managedObject];
             [self.managedObjectContext save:nil];
        }];
        
    }    
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{

    Spot *s = (Spot*)[self.fetchedResultsController objectAtIndexPath:indexPath];
    
    ListingViewController *lvc = [[ListingViewController alloc] initWithSpot:s];
    [self.navigationController pushViewController:lvc animated:YES];

}

#pragma mark - NSFetchedResultsControllerDelegate

- (void)controllerWillChangeContent:(NSFetchedResultsController *)controller {
    [self.tableView beginUpdates];
}

- (void)controller:(NSFetchedResultsController *)controller
  didChangeSection:(id <NSFetchedResultsSectionInfo>)sectionInfo
           atIndex:(NSUInteger)sectionIndex
     forChangeType:(NSFetchedResultsChangeType)type
{
    switch(type) {
        case NSFetchedResultsChangeInsert:
            [self.tableView insertSections:[NSIndexSet indexSetWithIndex:sectionIndex] withRowAnimation:UITableViewRowAnimationAutomatic];
            break;
        case NSFetchedResultsChangeDelete:
            [self.tableView deleteSections:[NSIndexSet indexSetWithIndex:sectionIndex] withRowAnimation:UITableViewRowAnimationAutomatic];
            break;
    }
}

- (void)controller:(NSFetchedResultsController *)controller
   didChangeObject:(id)object
       atIndexPath:(NSIndexPath *)indexPath
     forChangeType:(NSFetchedResultsChangeType)type
      newIndexPath:(NSIndexPath *)newIndexPath
{
    switch(type) {
        case NSFetchedResultsChangeInsert:
            [self.tableView insertRowsAtIndexPaths:[NSArray arrayWithObject:newIndexPath] withRowAnimation:UITableViewRowAnimationAutomatic];
            break;
        case NSFetchedResultsChangeDelete:
            [self.tableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath] withRowAnimation:UITableViewRowAnimationAutomatic];
            break;
        case NSFetchedResultsChangeUpdate:
            [self configureCell:[self.tableView cellForRowAtIndexPath:indexPath] forRowAtIndexPath:indexPath];
            break;
        case NSFetchedResultsChangeMove:
            [self.tableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath] withRowAnimation:UITableViewRowAnimationAutomatic];
            [self.tableView insertRowsAtIndexPaths:[NSArray arrayWithObject:newIndexPath] withRowAnimation:UITableViewRowAnimationAutomatic];
            break;
    }
}

- (void)controllerDidChangeContent:(NSFetchedResultsController *)controller {
    [self.tableView endUpdates];
    
}

- (void)viewDidUnload {
    [super viewDidUnload];
    self.pullToRefreshView = nil;
}

- (void)pullToRefreshViewDidStartLoading:(SSPullToRefreshView *)view {
    [self refreshData];
}


- (void)showAccount{
    
    AccountViewController  *accountViewController = [[AccountViewController alloc] initWithStyle:UITableViewStyleGrouped];
    UINavigationController *navController = [[UINavigationController alloc] initWithRootViewController:accountViewController];
    
    [self.navigationController presentViewController:navController animated:YES completion:nil];
    
}

- (void)showMapView{
    
    [self dismissViewControllerAnimated:YES completion:nil];

}

@end
