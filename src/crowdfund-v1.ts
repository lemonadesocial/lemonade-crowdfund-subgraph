import { BigInt } from "@graphprotocol/graph-ts"

import {
  Create as CreateEvent,
  Fund as FundEvent,
  StateChanged as StateChangedEvent,
} from "../generated/CrowdfundV1/CrowdfundV1"
import { Assignment, Campaign, CampaignFund, CampaignContributor } from "../generated/schema"

const StateMap = [
  'PENDING',
  'EXECUTED',
  'CONFIRMED',
  'REFUNDED'
]

export function handleCreate(event: CreateEvent): void {
  const campaign = new Campaign(
    event.address.toHexString() + '_' + event.params.campaignId.toString()
  )

  campaign.creator = event.params.creator
  campaign.title = event.params.title
  campaign.description = event.params.description
  campaign.state = 'PENDING'
  campaign.totalFunded = BigInt.fromI32(0)
  campaign.blockNumber = event.block.number
  campaign.blockTimestamp = event.block.timestamp
  campaign.transactionHash = event.transaction.hash

  campaign.save()

  const assignments = event.params.assignments
  for (let i = 0; i < assignments.length; i++) {
    const assignment = new Assignment(campaign.id + '_' + i.toString())
    assignment.campaign = campaign.id
    assignment.to = assignments[i].to
    assignment.count = assignments[i].count

    assignment.save()
  }
}

export function handleFund(event: FundEvent): void {
  const campaign = Campaign.load(
    event.address.toHexString() + '_' + event.params.campaignId.toString()
  )

  if (!campaign) return

  campaign.totalFunded = campaign.totalFunded.plus(event.params.amount)

  campaign.save()
  
  const campaignFund = new CampaignFund(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  campaignFund.campaign = event.params.campaignId.toString()
  campaignFund.amount = event.params.amount
  campaignFund.contributor = event.params.contributor
  campaignFund.blockNumber = event.block.number
  campaignFund.blockTimestamp = event.block.timestamp
  campaignFund.transactionHash = event.transaction.hash

  campaignFund.save()

  let campaignContributor = CampaignContributor.load(event.params.contributor)

  if (campaignContributor) {
    campaignContributor.counter += 1
  } else {
    campaignContributor = new CampaignContributor(event.params.contributor)
    campaignContributor.campaign = campaign.id
    campaignContributor.counter = 1
  }

  campaignContributor.save()
}

export function handleStateChanged(event: StateChangedEvent): void {
  const campaign = Campaign.load(
    event.address.toHexString() + '_' + event.params.campaignId.toString()
  )

  if (!campaign) return

  campaign.state = StateMap[event.params.state]

  campaign.save()
}
