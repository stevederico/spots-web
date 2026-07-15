//
//  TransactionViewController.m
//  ParkPro
//
//  Created by Steve Derico on 12/18/12.
//  Copyright (c) 2012 Bixby Apps. All rights reserved.
//

#import "TransactionViewController.h"

@interface TransactionViewController (){

    NSDate *timeIn;
    NSDate *timeOut;

}

@end

@implementation TransactionViewController
@synthesize spot;
- (id)initWithSpot:(Spot *)s{
    
    self = [super initWithNibName:@"TransactionViewController" bundle:nil];
    if (self) {        
        self.spot = s;
    
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    UIBarButtonItem *cancel = [[UIBarButtonItem alloc] initWithTitle:@"Cancel" style:UIBarButtonItemStyleBordered target:self action:@selector(cancelTapped)];
    self.navigationItem.leftBarButtonItem = cancel;
    UIBarButtonItem *buyButton = [[UIBarButtonItem alloc] initWithTitle:@"Buy" style:UIBarButtonItemStyleDone target:self action:@selector(buyTapped)];
    self.navigationItem.rightBarButtonItem = buyButton;
  
    
    self.title = @"Park Here";
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - UITableViewDataSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    
   
    return 2;
    
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    if (section == 0) {
        return 3;
    }
        return 2;
    
   
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    static NSString *CellIdentifier = @"Cell";
    
    SDTextFieldCell *cell = (SDTextFieldCell*)[tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (!cell) {
        cell = [[SDTextFieldCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:CellIdentifier];
        UIDatePicker *datePicker = [[UIDatePicker alloc] init];
        datePicker.datePickerMode = UIDatePickerModeDateAndTime;
        [datePicker addTarget:self action:@selector(datePickerValueChanged:) forControlEvents:UIControlEventValueChanged];
        datePicker.tag = indexPath.row;
        cell.textField.inputView = datePicker;
        
    }

    if (indexPath.row == 0 && indexPath.section == 0) {
        cell.textLabel.text = @"Time In";
        cell.detailTextLabel.text = timeIn.description;
      return cell;

    }else if (indexPath.row == 1 && indexPath.section == 0) {
        cell.textLabel.text = @"Time Out";
        cell.detailTextLabel.text = timeOut.description;
        return cell;
    }

    
    static NSString *CellTwo = @"Cell2";
    
    UITableViewCell *cell2 = [tableView dequeueReusableCellWithIdentifier:CellTwo];
    if (!cell2) {
        cell2 = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:CellTwo];
     
    }
    
    if (indexPath.row == 0 && indexPath.section == 1) {
        cell2.textLabel.text = @"Car";
        cell2.detailTextLabel.text = @"Car 123";
         return cell2;
    }else if (indexPath.row == 1 && indexPath.section == 1) {
        cell2.textLabel.text = @"Payment";
        cell2.detailTextLabel.text = @"VISA #1512";
         return cell2;
    }else  if (indexPath.row == 2 && indexPath.section == 0) {
        cell2.textLabel.text = @"Total Due";
        cell2.detailTextLabel.text = @"$15.00";
         return cell2;
    }
    
    return nil;

}

- (void)cancelTapped{
    
    [self dismissViewControllerAnimated:YES completion:nil];

}

- (IBAction)buyTapped{
    
     [self dismissViewControllerAnimated:YES completion:nil];

}



- (void)datePickerValueChanged:(UIDatePicker*)sender{

    UIDatePicker *s = sender;
    
    if (s.tag ==0) {
        timeIn = s.date;
    }else{
        timeOut = s.date;
    }
    
    
    NSLog(@"DATE Picker %d: %@",s.tag, s.date);
    
    [self.tableView reloadData];
    
}

@end
