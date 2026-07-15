//
//  AppDelegate.m
//  ParkPro
//
//  Created by Steve Derico on 12/10/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//
#import "SignInViewController.h"
#import "MapViewController.h"   
#import "AppDelegate.h"
#import "SpotsViewController.h"
#import "AFNetworkActivityIndicatorManager.h"

@implementation AppDelegate

@synthesize managedObjectContext = _managedObjectContext;
@synthesize managedObjectModel = _managedObjectModel;
@synthesize persistentStoreCoordinator = _persistentStoreCoordinator;
@synthesize loginViewController = _loginViewController;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    NSURLCache *URLCache = [[NSURLCache alloc] initWithMemoryCapacity:8 * 1024 * 1024 diskCapacity:20 * 1024 * 1024 diskPath:nil];
    [NSURLCache setSharedURLCache:URLCache];
    
    [[AFNetworkActivityIndicatorManager sharedManager] setEnabled:YES];
    
    self.navigationController = [[UINavigationController alloc] init];
    
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    self.window.rootViewController = self.navigationController;
    [self.window makeKeyAndVisible];
     
    self.loginViewController = [[SDLoginViewController alloc] init];
    [self.loginViewController setDelegate:self];
    UINavigationController *nvc = [[UINavigationController alloc] initWithRootViewController:_loginViewController];
    [self.navigationController presentViewController:nvc animated:YES completion:nil];
    
    
//    [SSKeychain deletePasswordForService:@"Spots" account:@"currentuser"];    
    
//    if (![SSKeychain passwordForService:@"Spots" account:@"currentuser"]){
//        SignInViewController *signInViewController = [[SignInViewController alloc] initWithNibName:@"SignInViewController" bundle:nil];
//        [self.navigationController presentViewController:signInViewController animated:YES completion:nil];
//        [SDLoginViewController presentModalLoginViewControllerOnViewController:self.navigationController withDelegate:self];
//    }else{
//        
//        [self setupLoggedInUser];
//  
//    }
    

    return YES;
}

- (void)setupLoggedInUser {
    [[ParkProAPIClient sharedClient] setDefaultHeader:@"auth_token" value:[SSKeychain passwordForService:@"Spots" account:@"currentuser"]];
    SpotsViewController *spotsViewController = [[SpotsViewController alloc] initWithNibName:@"SpotsViewController" bundle:nil];
    spotsViewController.managedObjectContext = self.managedObjectContext;
    
    MapViewController *mvc = [[MapViewController alloc] init];
    mvc.managedObjectContext = self.managedObjectContext;
    self.navigationController.viewControllers = [NSArray arrayWithObject:mvc];

}


- (void)applicationWillTerminate:(UIApplication *)application {
    // Saves changes in the application's managed object context before the application terminates.
    [self saveContext];
}

#pragma mark - Core Data

- (void)saveContext {
    NSError *error = nil;
    NSManagedObjectContext *managedObjectContext = self.managedObjectContext;
    if (managedObjectContext) {
        if ([managedObjectContext hasChanges] && ![managedObjectContext save:&error]) {
            NSLog(@"Unresolved error %@, %@", error, [error userInfo]);
            abort();
        }
    }
}

- (NSManagedObjectContext *)managedObjectContext {
    if (_managedObjectContext) {
        return _managedObjectContext;
    }
    
    NSPersistentStoreCoordinator *coordinator = [self persistentStoreCoordinator];
    if (coordinator) {
        _managedObjectContext = [[NSManagedObjectContext alloc] initWithConcurrencyType:NSMainQueueConcurrencyType];
        [_managedObjectContext setPersistentStoreCoordinator:coordinator];
    }
    
    return _managedObjectContext;
}

- (NSManagedObjectModel *)managedObjectModel {
    if (_managedObjectModel) {
        return _managedObjectModel;
    }
    
    NSURL *modelURL = [[NSBundle mainBundle] URLForResource:@"ParkPro" withExtension:@"momd"];
    _managedObjectModel = [[NSManagedObjectModel alloc] initWithContentsOfURL:modelURL];
    
    return _managedObjectModel;
}

- (NSPersistentStoreCoordinator *)persistentStoreCoordinator {
    if (_persistentStoreCoordinator) {
        return _persistentStoreCoordinator;
    }
    
    _persistentStoreCoordinator = [[NSPersistentStoreCoordinator alloc] initWithManagedObjectModel:[self managedObjectModel]];
    
    AFIncrementalStore *incrementalStore = (AFIncrementalStore *)[_persistentStoreCoordinator addPersistentStoreWithType:[ParkProIncrementalStore type] configuration:nil URL:nil options:nil error:nil];
    
    NSURL *applicationDocumentsDirectory = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] lastObject];
    NSURL *storeURL = [applicationDocumentsDirectory URLByAppendingPathComponent:@"ParkPro.sqlite"];
    
    NSDictionary *options = @{
        NSInferMappingModelAutomaticallyOption : @(YES),
        NSMigratePersistentStoresAutomaticallyOption: @(YES)
    };
    
    NSError *error = nil;
    if (![incrementalStore.backingPersistentStoreCoordinator addPersistentStoreWithType:NSSQLiteStoreType configuration:nil URL:storeURL options:options error:&error]) {
        NSLog(@"Unresolved error %@, %@", error, [error userInfo]);
        abort();
    }
    
    return _persistentStoreCoordinator;
}



#pragma mark - SDLoginViewControllerDelegate

- (void)loginViewControllerAuthenticateWithCredential:(NSURLCredential*)credential{
    
    NSDictionary *params = [NSDictionary dictionaryWithObjectsAndKeys:credential.user, @"email", credential.password,@"password", nil];
    
    //Send Request
    [[ParkProAPIClient sharedClient] postPath:@"/tokens" parameters:params success:^(AFHTTPRequestOperation *operation, id responseObject) {
        
        [self.loginViewController loginViewControllerDidAuthenticate];
        
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        
        NSString *message = [[(AFJSONRequestOperation*)operation responseJSON] valueForKey:@"message"];
        NSDictionary *userInfoDictionary = [[NSDictionary alloc] initWithObjectsAndKeys:message, NSLocalizedRecoverySuggestionErrorKey , nil];
        
        [self.loginViewController loginViewControllerFailedToAuthenticateWithError: [NSError errorWithDomain:@"SDLoginKit" code:[error code] userInfo:userInfoDictionary]];
    }];

}




@end
